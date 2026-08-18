// apps/web-spa/src/realtime/stompClient.ts
import { Client, ReconnectionTimeMode, type StompConfig } from '@stomp/stompjs';

// 백엔드가 열어둔 문. HTTP 가 아니라 ws 로 시작한다.
export const BROKER_URL = 'ws://localhost:8090/ws';

// 우리가 듣는 곳. /topic 은 여럿에게 뿌리는 자리라는 뜻이다.
export const POSTS_TOPIC = '/topic/posts';

export function createStompClient(overrides: Partial<StompConfig> = {}): Client {
  return new Client({
    brokerURL: BROKER_URL,

    // 끊기면 알아서 다시 붙는다. 처음에는 0.5초 뒤에 시도한다.
    reconnectDelay: 500,

    // 실패할 때마다 기다리는 시간을 두 배로 늘린다.
    // 기본값은 LINEAR — 그러면 모두가 같은 간격으로 서버 문을 두드린다.
    reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,

    // 아무리 늘어나도 여기까지만. 안 두면 15분까지 벌어진다(라이브러리 기본값).
    maxReconnectDelay: 30_000,

    // 서로 살아 있는지 확인하는 신호. 선이 조용히 끊긴 것을 알아채는 방법이다.
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,

    ...overrides,
  });
}

// 앱 전체가 쓰는 연결 하나. 화면마다 새로 열면 서버 쪽 연결 수가 화면 수만큼 늘어난다.
// (queryClient 를 React 바깥에서 한 번 만든 것과 같은 이유다.)
export const stompClient = createStompClient();
