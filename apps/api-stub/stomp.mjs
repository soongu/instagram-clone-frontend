// apps/api-stub/stomp.mjs
//
// WebSocket 위에 얹는 STOMP 브로커의 최소 구현.
//
// 백엔드 과목의 Spring 설정과 같은 규칙을 쓴다.
//   /app   — 클라이언트가 서버로 보내는 곳
//   /topic — 여럿에게 뿌리는 곳
//   /queue — 한 사람에게만 가는 곳 (/user/queue/... 로 구독한다)

import { upgradeToWebSocket } from './websocket.mjs';

// 프레임의 끝을 알리는 한 바이트. 눈에는 안 보이지만 반드시 붙어야 한다.
const NULL = '\0';

/** 프레임 한 덩이를 글자로 만든다. STOMP 는 눈으로 읽히는 텍스트 규약이다. */
function serialize(command, headers, body = '') {
  const lines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
  return `${command}\n${lines.join('\n')}\n\n${body}${NULL}`;
}

/** 받은 글자를 명령·헤더·본문으로 가른다. */
function parse(text) {
  const divider = text.indexOf('\n\n');
  if (divider === -1) return null;

  const head = text.slice(0, divider).split('\n');
  const command = head[0];

  const headers = {};
  for (const line of head.slice(1)) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon);
    // 같은 헤더가 여러 번 오면 처음 것이 이긴다(규격).
    if (!(key in headers)) headers[key] = line.slice(colon + 1);
  }

  const body = text.slice(divider + 2).replace(/\0$/, '');
  return { command, headers, body };
}

export function createStompBroker({ log = () => {} } = {}) {
  const sessions = new Set();
  let nextSessionId = 1;
  let nextMessageId = 1;

  // /app/... 으로 들어온 것을 받을 핸들러. Spring 의 @MessageMapping 자리다.
  const handlers = new Map();

  function onAppMessage(destination, handler) {
    handlers.set(destination, handler);
  }

  /** 구독 중인 모두에게 보낸다. */
  function broadcast(destination, payload) {
    for (const session of sessions) {
      deliver(session, destination, payload);
    }
  }

  /** 그 사람에게만 보낸다. 클라이언트는 /user/queue/... 로 구독한다. */
  function sendToUser(username, destination, payload) {
    for (const session of sessions) {
      if (session.username === username) deliver(session, destination, payload);
    }
  }

  function deliver(session, destination, payload) {
    for (const [id, subscribed] of session.subscriptions) {
      if (subscribed !== destination) continue;
      session.socket.send(
        serialize(
          'MESSAGE',
          {
            subscription: id,
            'message-id': `msg-${nextMessageId++}`,
            destination,
            'content-type': 'application/json',
          },
          JSON.stringify(payload),
        ),
      );
    }
  }

  function handleUpgrade(req, socket) {
    const session = {
      id: `sess-${nextSessionId++}`,
      username: null,
      subscriptions: new Map(),
      socket: null,
      heartbeat: null,
    };

    const connection = upgradeToWebSocket(req, socket, {
      // 우리는 STOMP 1.2 를 말한다. 클라이언트가 그것을 내밀면 그걸로 고른다.
      selectProtocol: (offered) =>
        offered.includes('v12.stomp') ? 'v12.stomp' : (offered[0] ?? null),
      onMessage: (text) => onFrame(session, text),
      onClose: () => {
        if (session.heartbeat !== null) clearInterval(session.heartbeat);
        sessions.delete(session);
        log(`[stomp] 연결이 끊겼습니다 (${session.id}) — 남은 연결 ${sessions.size}`);
      },
    });

    if (connection === null) return;
    session.socket = connection;
    sessions.add(session);
  }

  function onFrame(session, text) {
    // 하트비트는 줄바꿈 한 글자로만 온다.
    if (text === '\n' || text === '\r\n') return;

    const frame = parse(text);
    if (frame === null) return;

    switch (frame.command) {
      case 'CONNECT':
      case 'STOMP':
        return onConnect(session, frame);
      case 'SUBSCRIBE':
        session.subscriptions.set(frame.headers.id, frame.headers.destination);
        log(`[stomp] 구독 ${frame.headers.destination} (${session.id})`);
        return receiptIfAsked(session, frame);
      case 'UNSUBSCRIBE':
        session.subscriptions.delete(frame.headers.id);
        return receiptIfAsked(session, frame);
      case 'SEND':
        return onSend(session, frame);
      case 'DISCONNECT':
        receiptIfAsked(session, frame);
        return session.socket.close();
      default:
        return;
    }
  }

  function onConnect(session, frame) {
    // 로그인한 사람이 누구인지는 CONNECT 헤더로 받는다.
    // 진짜 서버라면 여기서 JWT 를 검사한다(백엔드 과목의 StompChannelInterceptor).
    session.username = frame.headers.login ?? 'guest';

    // 하트비트 협상. "내가 보낼 간격, 내가 받고 싶은 간격" 을 서로 말한다.
    const [wantsFromServer] = (frame.headers['heart-beat'] ?? '0,0').split(',').map(Number);
    const outgoing = wantsFromServer === 0 ? 0 : Math.max(wantsFromServer, 1000);

    session.socket.send(
      serialize('CONNECTED', {
        version: '1.2',
        'heart-beat': `${outgoing},${outgoing}`,
        session: session.id,
        'user-name': session.username,
      }),
    );

    if (outgoing > 0) {
      session.heartbeat = setInterval(() => session.socket.send('\n'), outgoing);
    }

    log(`[stomp] ${session.username} 님이 연결했습니다 (${session.id}) — 전체 ${sessions.size}`);
  }

  function onSend(session, frame) {
    const destination = frame.headers.destination ?? '';
    let payload = {};
    try {
      payload = frame.body === '' ? {} : JSON.parse(frame.body);
    } catch {
      payload = { raw: frame.body };
    }

    const handler = handlers.get(destination);
    if (handler !== undefined) handler(payload, session);

    receiptIfAsked(session, frame);
  }

  function receiptIfAsked(session, frame) {
    const receipt = frame.headers.receipt;
    if (receipt !== undefined) {
      session.socket.send(serialize('RECEIPT', { 'receipt-id': receipt }));
    }
  }

  return {
    handleUpgrade,
    onAppMessage,
    broadcast,
    sendToUser,
    get connectionCount() {
      return sessions.size;
    },
  };
}
