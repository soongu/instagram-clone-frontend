// C-8 검증용 흉내 브로커.
//
// 진짜 서버(apps/api-stub)는 강의에서 학생이 띄우고, 여기서는 포트를 안 쓴다.
// @stomp/stompjs 의 webSocketFactory 자리에 끼워 넣어 프레임만 주고받는다.
// C-5 의 "네트워크를 안 보는 판에 네트워크를 얹지 않는다" 와 같은 이유다.

import { StompSocketState, type IStompSocket } from '@stomp/stompjs';

const NULL = '\0';

interface ParsedFrame {
  command: string;
  headers: Record<string, string>;
  body: string;
}

function parse(raw: string): ParsedFrame | null {
  const text = raw.endsWith(NULL) ? raw.slice(0, -1) : raw;
  const divider = text.indexOf('\n\n');
  if (divider === -1) return null;

  const head = text.slice(0, divider).split('\n');
  const headers: Record<string, string> = {};
  for (const line of head.slice(1)) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon);
    if (!(key in headers)) headers[key] = line.slice(colon + 1);
  }
  return { command: head[0], headers, body: text.slice(divider + 2) };
}

function serialize(command: string, headers: Record<string, string>, body = ''): string {
  const lines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
  return `${command}\n${lines.join('\n')}\n\n${body}${NULL}`;
}

export interface FakeBroker {
  /** Client 의 webSocketFactory 에 그대로 넘긴다. */
  webSocketFactory: () => IStompSocket;
  /** 구독 중인 연결에 서버가 먼저 말을 건다. */
  push(destination: string, payload: unknown): void;
  /** 서버가 죽은 것처럼 연결을 끊는다. */
  dropAll(): void;
  /** 다음 연결 시도를 실패시킨다(서버가 아직 안 살아난 상태). */
  refuseNext(count: number): void;
  readonly sent: ParsedFrame[];
  readonly subscriptions: string[];
  readonly openCount: number;
  readonly connectHeaders: Record<string, string>[];
}

export function createFakeBroker(): FakeBroker {
  const sockets = new Set<FakeSocket>();
  const sent: ParsedFrame[] = [];
  const connectHeaders: Record<string, string>[] = [];
  let openCount = 0;
  let refusals = 0;
  let messageId = 0;

  class FakeSocket implements IStompSocket {
    url = 'ws://fake/ws';
    onopen: ((ev?: unknown) => unknown) | undefined | null = null;
    onclose: ((ev?: unknown) => unknown) | undefined | null = null;
    onerror: ((ev: unknown) => unknown) | undefined | null = null;
    onmessage: ((ev: unknown) => unknown) | undefined | null = null;

    readyState: number = StompSocketState.CONNECTING;
    subscriptions = new Map<string, string>();

    constructor() {
      // 실제 연결처럼 한 박자 뒤에 열린다.
      setTimeout(() => {
        if (refusals > 0) {
          refusals -= 1;
          this.readyState = StompSocketState.CLOSED;
          this.onclose?.({ code: 1006, reason: '서버가 아직 안 살아났습니다' });
          return;
        }
        this.readyState = StompSocketState.OPEN;
        openCount += 1;
        sockets.add(this);
        this.onopen?.();
      }, 0);
    }

    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
      if (typeof data !== 'string') return;
      if (data === '\n' || data === '\r\n') return; // 하트비트

      const frame = parse(data);
      if (frame === null) return;
      sent.push(frame);

      if (frame.command === 'CONNECT' || frame.command === 'STOMP') {
        connectHeaders.push(frame.headers);
        this.receive(
          serialize('CONNECTED', { version: '1.2', 'heart-beat': '0,0', session: 'fake-1' }),
        );
        return;
      }
      if (frame.command === 'SUBSCRIBE') {
        this.subscriptions.set(frame.headers.id, frame.headers.destination);
        return;
      }
      if (frame.command === 'UNSUBSCRIBE') {
        this.subscriptions.delete(frame.headers.id);
        return;
      }
      if (frame.command === 'DISCONNECT') {
        const receipt = frame.headers.receipt;
        if (receipt !== undefined) this.receive(serialize('RECEIPT', { 'receipt-id': receipt }));
        this.close();
      }
    }

    receive(raw: string): void {
      this.onmessage?.({ data: raw });
    }

    close(): void {
      if (this.readyState === StompSocketState.CLOSED) return;
      this.readyState = StompSocketState.CLOSED;
      sockets.delete(this);
      this.onclose?.({ code: 1000 });
    }
  }

  return {
    webSocketFactory: () => new FakeSocket(),
    push(destination, payload) {
      for (const socket of sockets) {
        for (const [id, subscribed] of socket.subscriptions) {
          if (subscribed !== destination) continue;
          socket.receive(
            serialize(
              'MESSAGE',
              { subscription: id, 'message-id': `m-${(messageId += 1)}`, destination },
              JSON.stringify(payload),
            ),
          );
        }
      }
    },
    dropAll() {
      for (const socket of [...sockets]) socket.close();
    },
    refuseNext(count) {
      refusals = count;
    },
    get sent() {
      return sent;
    },
    get subscriptions() {
      return [...sockets].flatMap((socket) => [...socket.subscriptions.values()]);
    },
    get openCount() {
      return openCount;
    },
    get connectHeaders() {
      return connectHeaders;
    },
  };
}
