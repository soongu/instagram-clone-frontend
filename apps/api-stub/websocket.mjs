// apps/api-stub/websocket.mjs
//
// WebSocket 서버의 최소 구현. Node 내장 crypto 만 쓴다.
//
// 브라우저가 보내는 업그레이드 요청을 받아 101 로 답하고, 그 뒤로는
// TCP 소켓 위에 프레임을 얹어 주고받는다. 프레임 규격은 RFC 6455 다.

import { createHash } from 'node:crypto';

// 규격이 정해둔 고정 문자열. 서로가 WebSocket 을 말한다는 증표를 만들 때 쓴다.
const MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

const OP_CONTINUATION = 0x0;
const OP_TEXT = 0x1;
const OP_CLOSE = 0x8;
const OP_PING = 0x9;
const OP_PONG = 0xa;

function acceptKey(clientKey) {
  return createHash('sha1').update(clientKey + MAGIC).digest('base64');
}

/**
 * 업그레이드 요청을 받아 연결을 세운다.
 * onMessage(text) · onClose() 를 붙여 쓰고, send(text) 로 보낸다.
 */
export function upgradeToWebSocket(req, socket, { onMessage, onClose, selectProtocol }) {
  const key = req.headers['sec-websocket-key'];
  if (typeof key !== 'string') {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    return null;
  }

  // 클라이언트가 "이 통로 위에서 이 말을 쓰자" 며 목록을 내민다.
  // 고른 것을 돌려주지 않으면 클라이언트가 연결을 끊는다.
  const offered = (req.headers['sec-websocket-protocol'] ?? '')
    .split(',')
    .map((it) => it.trim())
    .filter((it) => it !== '');
  const chosen = selectProtocol === undefined ? null : selectProtocol(offered);

  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      `Sec-WebSocket-Accept: ${acceptKey(key)}\r\n` +
      (chosen === null ? '' : `Sec-WebSocket-Protocol: ${chosen}\r\n`) +
      '\r\n',
  );

  socket.setNoDelay(true);

  let buffer = Buffer.alloc(0);
  let closed = false;

  // 조각나서 온 프레임을 모으는 자리.
  let fragments = [];

  function send(text) {
    if (closed || socket.destroyed) return;
    socket.write(encodeFrame(OP_TEXT, Buffer.from(text, 'utf8')));
  }

  function close() {
    if (closed) return;
    closed = true;
    if (!socket.destroyed) {
      socket.write(encodeFrame(OP_CLOSE, Buffer.alloc(0)));
      socket.end();
    }
  }

  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    for (;;) {
      const frame = decodeFrame(buffer);
      if (frame === null) break;
      buffer = buffer.subarray(frame.size);

      if (frame.opcode === OP_CLOSE) {
        close();
        break;
      }
      if (frame.opcode === OP_PING) {
        socket.write(encodeFrame(OP_PONG, frame.payload));
        continue;
      }
      if (frame.opcode === OP_PONG) continue;

      if (frame.opcode === OP_TEXT || frame.opcode === OP_CONTINUATION) {
        fragments.push(frame.payload);
        if (frame.fin) {
          const text = Buffer.concat(fragments).toString('utf8');
          fragments = [];
          onMessage(text);
        }
      }
    }
  });

  socket.on('close', () => {
    closed = true;
    onClose();
  });
  socket.on('error', () => {
    closed = true;
    socket.destroy();
  });

  return { send, close };
}

/** 서버가 보내는 프레임에는 마스크를 씌우지 않는다(규격이 그렇게 정해뒀다). */
function encodeFrame(opcode, payload) {
  const length = payload.length;
  let header;

  if (length < 126) {
    header = Buffer.alloc(2);
    header[1] = length;
  } else if (length < 65536) {
    header = Buffer.alloc(4);
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }

  header[0] = 0x80 | opcode; // FIN=1
  return Buffer.concat([header, payload]);
}

/** 다 안 왔으면 null 을 돌려준다. 더 기다렸다 다시 부르라는 뜻이다. */
function decodeFrame(buffer) {
  if (buffer.length < 2) return null;

  const fin = (buffer[0] & 0x80) !== 0;
  const opcode = buffer[0] & 0x0f;
  const masked = (buffer[1] & 0x80) !== 0;
  let length = buffer[1] & 0x7f;
  let offset = 2;

  if (length === 126) {
    if (buffer.length < offset + 2) return null;
    length = buffer.readUInt16BE(offset);
    offset += 2;
  } else if (length === 127) {
    if (buffer.length < offset + 8) return null;
    length = Number(buffer.readBigUInt64BE(offset));
    offset += 8;
  }

  let maskKey = null;
  if (masked) {
    if (buffer.length < offset + 4) return null;
    maskKey = buffer.subarray(offset, offset + 4);
    offset += 4;
  }

  if (buffer.length < offset + length) return null;

  const payload = Buffer.from(buffer.subarray(offset, offset + length));
  if (maskKey !== null) {
    // 브라우저가 보내는 프레임은 4바이트 키로 뒤섞여 있다. 되돌린다.
    for (let i = 0; i < payload.length; i += 1) {
      payload[i] ^= maskKey[i % 4];
    }
  }

  return { fin, opcode, payload, size: offset + length };
}
