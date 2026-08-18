// apps/web-spa/src/components/c8-raw-socket.test.tsx
// C-8 Step 3 — 날 WebSocket 으로 붙어보면 무엇이 없나 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { RawSocketDemo } from './RawSocketDemo';

// 브라우저의 WebSocket 을 흉내 낸 최소한. 보낸 것을 그대로 돌려준다.
class EchoSocket {
  static last: EchoSocket | null = null;

  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  sent: string[] = [];

  constructor() {
    EchoSocket.last = this;
    setTimeout(() => this.onopen?.(), 0);
  }

  send(data: string) {
    this.sent.push(data);
    setTimeout(() => this.onmessage?.({ data: `서버가 받은 것: ${data}` }), 0);
  }

  // 서버가 먼저 말을 거는 자리
  pushFromServer(text: string) {
    this.onmessage?.({ data: text });
  }

  close() {
    this.onclose?.();
  }
}

function renderDemo() {
  return render(<RawSocketDemo createSocket={() => new EchoSocket() as unknown as WebSocket} />);
}

describe('날 WebSocket — 통로는 열린다', () => {
  it('열리면 상태가 바뀐다', async () => {
    renderDemo();
    expect(await screen.findByText('연결 상태: 열림')).toBeInTheDocument();
  });

  it('★ 서버가 먼저 말을 걸 수 있다 — 우리가 안 물어봤는데 온다', async () => {
    renderDemo();
    await screen.findByText('연결 상태: 열림');

    EchoSocket.last?.pushFromServer('누가 회원님의 게시물을 좋아합니다');

    expect(
      await screen.findByText('누가 회원님의 게시물을 좋아합니다'),
    ).toBeInTheDocument();
  });

  it('보낸 것이 돌아온다', async () => {
    const user = userEvent.setup();
    renderDemo();
    await screen.findByText('연결 상태: 열림');

    await user.click(screen.getByRole('button', { name: '보내기' }));

    expect(await screen.findByText('서버가 받은 것: 안녕하세요')).toBeInTheDocument();
  });

  it('★ 오는 것은 문자열 하나뿐이다 — 종류도 받는 사람도 적혀 있지 않다', async () => {
    renderDemo();
    await screen.findByText('연결 상태: 열림');

    // 좋아요 소식과 쪽지가 같은 통로로 온다.
    EchoSocket.last?.pushFromServer('좋아요 1300');
    EchoSocket.last?.pushFromServer('minji: 안녕!');

    await screen.findByText('좋아요 1300');
    await screen.findByText('minji: 안녕!');

    // 둘을 가려낼 방법이 화면에는 없다. 우리가 규칙을 직접 정해야 한다.
    // 그 규칙을 이미 정해둔 것이 STOMP 다.
    expect(screen.getByText('좋아요 1300')).toBeInTheDocument();
    expect(screen.getByText('minji: 안녕!')).toBeInTheDocument();
  });
});
