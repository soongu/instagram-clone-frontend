// apps/web-spa/src/components/b2-state.test.tsx
// B-2 Step 1~3 — 이벤트 핸들링 · useState · 조건부 렌더링 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ClickCounter } from './ClickCounter';
// Step 2~3 시점의 LikeButton (Step 5 에서 제어 컴포넌트로 바뀌기 전 모습)
import { LikeButton as SelfStateLikeButton } from '../../scratch/b2-step3-likebutton';

describe('ClickCounter — 일반 변수는 화면을 못 바꾼다', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('클릭해도 화면의 숫자는 0 그대로다', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<ClickCounter />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('눌린 횟수: 0');

    await user.click(button);
    await user.click(button);

    expect(button).toHaveTextContent('눌린 횟수: 0');
  });

  it('핸들러 자체는 불린다 — 값이 바뀌어도 화면에 반영이 안 될 뿐이다', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<ClickCounter />);

    await user.click(screen.getByRole('button'));

    expect(spy).toHaveBeenCalledWith('지금 clickCount 는', 1);
  });
});

describe('LikeButton — useState 로 화면이 기억한다', () => {
  it('초기값을 props 로 받아 첫 화면을 그린다', () => {
    render(<SelfStateLikeButton initialLiked={false} initialLikeCount={1240} />);

    expect(screen.getByRole('button')).toHaveTextContent('♡ 좋아요');
    expect(screen.getByText('좋아요 1240개')).toBeInTheDocument();
  });

  it('클릭하면 상태가 바뀌고 화면이 다시 그려진다', async () => {
    const user = userEvent.setup();
    render(<SelfStateLikeButton initialLiked={false} initialLikeCount={1240} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toHaveTextContent('♥ 좋아요 취소');
    expect(screen.getByText('좋아요 1241개')).toBeInTheDocument();
  });

  it('한 번 더 누르면 원래대로 돌아온다', async () => {
    const user = userEvent.setup();
    render(<SelfStateLikeButton initialLiked={false} initialLikeCount={1240} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toHaveTextContent('♡ 좋아요');
    expect(screen.getByText('좋아요 1240개')).toBeInTheDocument();
  });

  it('이미 눌린 게시물은 눌린 모습으로 시작한다', () => {
    render(<SelfStateLikeButton initialLiked initialLikeCount={8500} />);

    expect(screen.getByRole('button')).toHaveTextContent('♥ 좋아요 취소');
  });

  it('컴포넌트가 둘이면 상태도 둘이다 — 한쪽을 눌러도 다른 쪽은 그대로다', async () => {
    const user = userEvent.setup();
    render(
      <>
        <SelfStateLikeButton initialLiked={false} initialLikeCount={1240} />
        <SelfStateLikeButton initialLiked={false} initialLikeCount={8500} />
      </>,
    );

    const [firstButton] = screen.getAllByRole('button');
    await user.click(firstButton);

    expect(screen.getByText('좋아요 1241개')).toBeInTheDocument();
    expect(screen.getByText('좋아요 8500개')).toBeInTheDocument();
  });
});

describe('LikeButton — 조건부 렌더링', () => {
  it('눌린 상태에서만 className 에 liked 가 붙는다', async () => {
    const user = userEvent.setup();
    render(<SelfStateLikeButton initialLiked={false} initialLikeCount={1240} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('like-button');
    expect(button).not.toHaveClass('liked');

    await user.click(button);

    expect(button).toHaveClass('liked');
  });

  it('좋아요가 0 개면 문구 자체가 화면에 없다', () => {
    render(<SelfStateLikeButton initialLiked={false} initialLikeCount={0} />);

    expect(screen.queryByText(/좋아요 \d+개/)).not.toBeInTheDocument();
  });

  it('0 개에서 한 번 누르면 문구가 나타난다', async () => {
    const user = userEvent.setup();
    render(<SelfStateLikeButton initialLiked={false} initialLikeCount={0} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('좋아요 1개')).toBeInTheDocument();
  });
});
