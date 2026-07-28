// apps/web-spa/src/components/b4-toast.test.tsx
// 클린업이 있고 없고가 알림에 어떤 차이를 만드는지 시간을 돌려서 잰다.
import { useEffect, useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { App } from '../App';

const TOAST_DURATION = 3000;

// 클린업만 켜고 끌 수 있게 만든 비교용 화면
function ToastBox({ withCleanup }: { withCleanup: boolean }) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (message === null) {
      return;
    }

    const timerId = setTimeout(() => setMessage(null), TOAST_DURATION);

    if (withCleanup) {
      return () => clearTimeout(timerId);
    }
  }, [message, withCleanup]);

  return (
    <div>
      <button onClick={() => setMessage('첫 번째 알림')}>첫 번째</button>
      <button onClick={() => setMessage('두 번째 알림')}>두 번째</button>
      <p data-testid="msg">{message ?? '(없음)'}</p>
    </div>
  );
}

// 첫 알림을 띄우고 2초 뒤 두 번째 알림을 띄운 다음, 두 시점의 화면을 본다.
function pressTwice(withCleanup: boolean) {
  render(<ToastBox withCleanup={withCleanup} />);

  act(() => {
    screen.getByRole('button', { name: '첫 번째' }).click();
  });
  act(() => {
    vi.advanceTimersByTime(2000);
  });
  act(() => {
    screen.getByRole('button', { name: '두 번째' }).click();
  });

  // 두 번째 알림이 뜬 지 1.1초 — 첫 타이머가 살아 있으면 여기서 알림을 지운다
  act(() => {
    vi.advanceTimersByTime(1100);
  });
  const afterFirstTimer = screen.getByTestId('msg').textContent;

  // 두 번째 알림이 뜬 지 3.1초 — 제대로면 여기서 사라진다
  act(() => {
    vi.advanceTimersByTime(2000);
  });
  const afterOwnTimer = screen.getByTestId('msg').textContent;

  return { afterFirstTimer, afterOwnTimer };
}

describe('알림 타이머와 클린업', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('클린업이 없으면 두 번째 알림이 제 시간을 못 채우고 사라진다', () => {
    vi.useFakeTimers();

    const result = pressTwice(false);

    // 첫 알림이 걸어둔 타이머가 남아 있다가 두 번째 알림을 지워버린다
    expect(result.afterFirstTimer).toBe('(없음)');
    expect(result.afterOwnTimer).toBe('(없음)');
  });

  it('클린업이 있으면 두 번째 알림이 제 시간을 다 채운다', () => {
    vi.useFakeTimers();

    const result = pressTwice(true);

    expect(result.afterFirstTimer).toBe('두 번째 알림');
    expect(result.afterOwnTimer).toBe('(없음)');
  });
});

// 가짜 시간을 쓸 때는 userEvent 대신 직접 click 을 부른다
function click(name: string) {
  act(() => {
    screen.getAllByRole('button', { name })[0].click();
  });
}

describe('App 의 알림', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('좋아요를 누르면 알림이 뜨고 3초 뒤 사라진다', () => {
    vi.useFakeTimers();
    render(<App />);

    click('♡ 좋아요');

    expect(screen.getByRole('status')).toHaveTextContent(
      'jaehoon님의 게시물을 좋아합니다',
    );

    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION + 100);
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('좋아요를 취소하면 취소했다는 알림이 뜬다', () => {
    vi.useFakeTimers();
    render(<App />);

    // minji 의 게시물은 처음부터 좋아요가 눌려 있다
    click('♥ 좋아요 취소');

    expect(screen.getByRole('status')).toHaveTextContent(
      'minji님의 게시물 좋아요를 취소했습니다',
    );
  });
});

describe('App 의 탭 제목', () => {
  it('좋아요 개수가 탭 제목에 따라붙는다', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 처음엔 minji 게시물 하나만 좋아요가 눌려 있다
    expect(document.title).toBe('인스타그램 (좋아요 1)');

    await user.click(screen.getAllByRole('button', { name: '♡ 좋아요' })[0]);

    expect(document.title).toBe('인스타그램 (좋아요 2)');
  });
});
