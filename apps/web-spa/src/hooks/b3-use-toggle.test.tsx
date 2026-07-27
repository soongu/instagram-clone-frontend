// apps/web-spa/src/hooks/b3-use-toggle.test.tsx
// B-3 Step 7 — 훅은 로직을 나눠 쓰는 것이지 상태를 나눠 쓰는 게 아니다 (내부 검증용)
import { render, screen, within, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { useToggle } from './useToggle';
import { PostBody } from '../components/PostBody';
import { Feed } from '../components/Feed';
import { feedPosts } from '../data/feed';

describe('useToggle — 훅만 따로 돌려본다', () => {
  it('기본값은 꺼짐이고, 부를 때마다 뒤집힌다', () => {
    const { result } = renderHook(() => useToggle());
    const [initialOn] = result.current;

    expect(initialOn).toBe(false);

    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);

    act(() => result.current[1]());
    expect(result.current[0]).toBe(false);
  });

  it('켜진 상태로 시작할 수도 있다', () => {
    const { result } = renderHook(() => useToggle(true));

    expect(result.current[0]).toBe(true);
  });

  it('한 컴포넌트에서 두 번 불러도 상태가 안 섞인다', () => {
    const { result } = renderHook(() => ({
      caption: useToggle(),
      comments: useToggle(),
    }));

    act(() => result.current.caption[1]());

    expect(result.current.caption[0]).toBe(true);
    expect(result.current.comments[0]).toBe(false);
  });
});

describe('PostBody — 긴 캡션을 접었다 폈다 한다', () => {
  it('처음에는 앞부분만 보이고 더 보기 버튼이 붙는다', () => {
    render(
      <PostBody
        username="jaehoon"
        content="오늘 한강 노을이 미쳤다"
        liked={false}
        likeCount={1240}
        commentCount={32}
        onToggle={() => {}}
      />,
    );

    expect(screen.getByText('오늘 한강 노을이...')).toBeInTheDocument();
    expect(screen.queryByText('오늘 한강 노을이 미쳤다')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '더 보기' })).toBeInTheDocument();
  });

  it('더 보기를 누르면 전문이 나오고 버튼이 접기로 바뀐다', async () => {
    const user = userEvent.setup();
    render(
      <PostBody
        username="jaehoon"
        content="오늘 한강 노을이 미쳤다"
        liked={false}
        likeCount={1240}
        commentCount={32}
        onToggle={() => {}}
      />,
    );

    await user.click(screen.getByRole('button', { name: '더 보기' }));

    expect(screen.getByText('오늘 한강 노을이 미쳤다')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '접기' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '접기' }));

    expect(screen.getByText('오늘 한강 노을이...')).toBeInTheDocument();
  });

  it('짧은 캡션에는 버튼 자체가 안 붙는다', () => {
    render(
      <PostBody
        username="jaehoon"
        content="노을"
        liked={false}
        likeCount={1240}
        commentCount={32}
        onToggle={() => {}}
      />,
    );

    expect(screen.getByText('노을')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '더 보기' })).not.toBeInTheDocument();
  });

  it('캡션을 펼쳐도 좋아요는 부모 몫 그대로다', async () => {
    const user = userEvent.setup();
    render(
      <PostBody
        username="jaehoon"
        content="오늘 한강 노을이 미쳤다"
        liked={false}
        likeCount={1240}
        commentCount={32}
        onToggle={() => {}}
      />,
    );

    await user.click(screen.getByRole('button', { name: '더 보기' }));

    expect(screen.getByRole('button', { name: '♡ 좋아요' })).toBeInTheDocument();
    expect(screen.getByText('좋아요 1240개')).toBeInTheDocument();
  });
});

describe('같은 훅을 쓰는 카드가 둘이어도 상태는 각자의 것이다', () => {
  it('한 카드의 캡션을 펼쳐도 다른 카드는 접힌 채로 있다', async () => {
    const user = userEvent.setup();
    render(<Feed posts={feedPosts} onToggleLike={() => {}} />);

    const [firstCard, secondCard] = screen.getAllByRole('article');

    await user.click(within(firstCard).getByRole('button', { name: '더 보기' }));

    expect(within(firstCard).getByText('오늘 한강 노을이 미쳤다')).toBeInTheDocument();
    expect(within(firstCard).getByRole('button', { name: '접기' })).toBeInTheDocument();

    expect(within(secondCard).getByText('제주도 3박 4일...')).toBeInTheDocument();
    expect(within(secondCard).getByRole('button', { name: '더 보기' })).toBeInTheDocument();
  });
});
