// apps/web-spa/src/components/b3-answer.test.tsx
// B-3 과제 1 예시답안이 실제로 동작하는지, 오답판은 무엇이 어긋나는지 확인한다 (내부 검증용)
import { render, screen, within } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import {
  useSavedPosts,
  SaveButton,
  AppWithSaved,
  AppWithSavedInCard,
  AppWithSavedMutating,
} from '../../scratch/b3-story-answer';

describe('useSavedPosts', () => {
  it('처음에는 아무것도 저장돼 있지 않다', () => {
    const { result } = renderHook(() => useSavedPosts());

    expect(result.current.savedCount).toBe(0);
    expect(result.current.isSaved(1)).toBe(false);
  });

  it('저장하면 개수가 늘고 isSaved 가 참이 된다', () => {
    const { result } = renderHook(() => useSavedPosts());

    act(() => result.current.toggleSave(1));

    expect(result.current.savedCount).toBe(1);
    expect(result.current.isSaved(1)).toBe(true);
    expect(result.current.isSaved(2)).toBe(false);
  });

  it('같은 id 를 다시 누르면 목록에서 빠진다', () => {
    const { result } = renderHook(() => useSavedPosts());

    act(() => result.current.toggleSave(1));
    act(() => result.current.toggleSave(1));

    expect(result.current.savedCount).toBe(0);
    expect(result.current.isSaved(1)).toBe(false);
  });

  it('여러 개를 저장하면 개수가 그만큼 쌓인다', () => {
    const { result } = renderHook(() => useSavedPosts());

    act(() => result.current.toggleSave(1));
    act(() => result.current.toggleSave(2));
    act(() => result.current.toggleSave(3));

    expect(result.current.savedCount).toBe(3);
    act(() => result.current.toggleSave(2));
    expect(result.current.savedCount).toBe(2);
    expect(result.current.isSaved(2)).toBe(false);
  });

  it('돌려주는 것은 배열이 아니라 객체다', () => {
    const { result } = renderHook(() => useSavedPosts());

    expect(Array.isArray(result.current)).toBe(false);
    expect(Object.keys(result.current).sort()).toEqual([
      'isSaved',
      'savedCount',
      'toggleSave',
    ]);
  });

  it('훅을 두 번 부르면 저장 목록도 둘로 갈린다', () => {
    const { result } = renderHook(() => ({
      first: useSavedPosts(),
      second: useSavedPosts(),
    }));

    act(() => result.current.first.toggleSave(1));

    expect(result.current.first.savedCount).toBe(1);
    expect(result.current.second.savedCount).toBe(0);
  });
});

describe('SaveButton', () => {
  it('저장 전에는 빈 기호와 "저장" 이라는 이름을 갖는다', () => {
    render(<SaveButton saved={false} onToggle={() => {}} />);

    const button = screen.getByRole('button', { name: '저장' });
    expect(button).toHaveTextContent('⚐');
    expect(button).toHaveClass('save-button');
    expect(button).not.toHaveClass('saved');
  });

  it('저장 후에는 채운 기호와 "저장 취소" 라는 이름으로 바뀐다', () => {
    render(<SaveButton saved onToggle={() => {}} />);

    const button = screen.getByRole('button', { name: '저장 취소' });
    expect(button).toHaveTextContent('⚑');
    expect(button).toHaveClass('saved');
  });

  it('form 안에 있어도 제출 버튼이 되지 않는다', () => {
    render(<SaveButton saved={false} onToggle={() => {}} />);

    expect(screen.getByRole('button', { name: '저장' })).toHaveAttribute(
      'type',
      'button',
    );
  });
});

describe('훅을 App 에서 부른 답안', () => {
  it('처음에는 저장한 게시물이 0개다', () => {
    render(<AppWithSaved />);

    expect(screen.getByText('저장한 게시물 0개')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '저장' })).toHaveLength(2);
  });

  it('저장 버튼은 더보기 버튼 왼쪽에 있다', () => {
    render(<AppWithSaved />);

    const [firstCard] = screen.getAllByRole('article');
    const buttons = within(firstCard).getAllByRole('button');
    const saveAt = buttons.findIndex(
      (button) => button.getAttribute('aria-label') === '저장',
    );
    const moreAt = buttons.findIndex(
      (button) => button.getAttribute('aria-label') === '게시물 메뉴',
    );

    expect(saveAt).toBeGreaterThanOrEqual(0);
    expect(saveAt).toBeLessThan(moreAt);
  });

  it('카드에서 저장을 누르면 머리말 합계가 오른다', async () => {
    const user = userEvent.setup();
    render(<AppWithSaved />);

    const [firstCard] = screen.getAllByRole('article');
    await user.click(within(firstCard).getByRole('button', { name: '저장' }));

    expect(screen.getByText('저장한 게시물 1개')).toBeInTheDocument();
    expect(
      within(firstCard).getByRole('button', { name: '저장 취소' }),
    ).toBeInTheDocument();
  });

  it('두 카드를 다 저장하면 합계가 2개가 된다', async () => {
    const user = userEvent.setup();
    render(<AppWithSaved />);

    for (const button of screen.getAllByRole('button', { name: '저장' })) {
      await user.click(button);
    }

    expect(screen.getByText('저장한 게시물 2개')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '저장 취소' })).toHaveLength(2);
  });

  it('다시 누르면 합계가 도로 내려간다', async () => {
    const user = userEvent.setup();
    render(<AppWithSaved />);

    const [firstCard] = screen.getAllByRole('article');
    await user.click(within(firstCard).getByRole('button', { name: '저장' }));
    await user.click(
      within(firstCard).getByRole('button', { name: '저장 취소' }),
    );

    expect(screen.getByText('저장한 게시물 0개')).toBeInTheDocument();
  });

  it('한 카드를 저장해도 다른 카드는 그대로다', async () => {
    const user = userEvent.setup();
    render(<AppWithSaved />);

    const [firstCard, secondCard] = screen.getAllByRole('article');
    await user.click(within(firstCard).getByRole('button', { name: '저장' }));

    expect(
      within(secondCard).getByRole('button', { name: '저장' }),
    ).toBeInTheDocument();
    expect(screen.getByText('저장한 게시물 1개')).toBeInTheDocument();
  });

  it('저장과 좋아요는 서로를 건드리지 않는다', async () => {
    const user = userEvent.setup();
    render(<AppWithSaved />);

    const [firstCard] = screen.getAllByRole('article');
    await user.click(within(firstCard).getByRole('button', { name: '저장' }));

    expect(screen.getByText('좋아요 누른 게시물 1개')).toBeInTheDocument();
    expect(within(firstCard).getByText('좋아요 1240개')).toBeInTheDocument();
  });
});

describe('오답판 1 — 훅을 PostCard 안에서 부르면', () => {
  it('버튼 기호는 멀쩡히 바뀐다 (그래서 얼핏 맞아 보인다)', async () => {
    const user = userEvent.setup();
    render(<AppWithSavedInCard />);

    const [firstCard] = screen.getAllByRole('article');
    await user.click(within(firstCard).getByRole('button', { name: '저장' }));

    expect(
      within(firstCard).getByRole('button', { name: '저장 취소' }),
    ).toBeInTheDocument();
  });

  it('그런데 머리말 합계가 0개에서 꿈쩍하지 않는다', async () => {
    const user = userEvent.setup();
    render(<AppWithSavedInCard />);

    expect(screen.getByText('저장한 게시물 0개')).toBeInTheDocument();

    for (const button of screen.getAllByRole('button', { name: '저장' })) {
      await user.click(button);
    }

    expect(screen.getByText('저장한 게시물 0개')).toBeInTheDocument();
    expect(screen.queryByText('저장한 게시물 2개')).toBeNull();
  });

  it('카드마다 목록이 따로라 한 장을 저장해도 그 카드만 1개를 안다', async () => {
    const user = userEvent.setup();
    render(<AppWithSavedInCard />);

    const [firstCard, secondCard] = screen.getAllByRole('article');
    await user.click(within(firstCard).getByRole('button', { name: '저장' }));

    expect(
      within(secondCard).getByRole('button', { name: '저장' }),
    ).toBeInTheDocument();
    expect(screen.getByText('저장한 게시물 0개')).toBeInTheDocument();
  });
});

describe('오답판 2 — 원본 배열을 그 자리에서 고치면', () => {
  it('눌러도 화면이 아예 안 바뀐다', async () => {
    const user = userEvent.setup();
    render(<AppWithSavedMutating />);

    const [firstCard] = screen.getAllByRole('article');
    await user.click(within(firstCard).getByRole('button', { name: '저장' }));

    expect(screen.getByText('저장한 게시물 0개')).toBeInTheDocument();
    expect(
      within(firstCard).getByRole('button', { name: '저장' }),
    ).toBeInTheDocument();
  });
});
