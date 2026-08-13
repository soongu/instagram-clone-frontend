// apps/web-spa/src/hooks/b3-use-like-toggle.test.tsx
// B-3 Step 6 — App 이 들고 있던 좋아요 로직을 훅으로 옮겨도 그대로인지 (내부 검증용)
import { render, screen, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToStaticMarkup } from 'react-dom/server';
import { toB3Classes, b3BridgeHits, toVisibleText } from '../../scratch/e2-b3-class-bridge';
import { describe, it, expect } from 'vitest';
import { HomePage } from '../routes/HomePage';
import { AppBeforeHook } from '../../scratch/b3-lecture-snapshots';
import { useLikeToggle } from './useLikeToggle';
import { feedPosts } from '../data/feed';

describe('useLikeToggle — 훅만 따로 돌려본다', () => {
  it('넘긴 게시물을 그대로 돌려주고, 좋아요 누른 수를 함께 센다', () => {
    const { result } = renderHook(() => useLikeToggle(feedPosts));

    // 두 번째 게시물이 처음부터 좋아요 눌린 상태라 1 에서 시작한다
    expect(result.current.posts).toBe(feedPosts);
    expect(result.current.likedCount).toBe(1);
  });

  it('toggle 을 부르면 그 게시물만 바뀐다', () => {
    const { result } = renderHook(() => useLikeToggle(feedPosts));
    const [first, second] = feedPosts;

    act(() => result.current.toggle(first.id));

    expect(result.current.posts[0].liked).toBe(true);
    expect(result.current.posts[0].likeCount).toBe(first.likeCount + 1);
    expect(result.current.posts[1]).toBe(second);
    expect(result.current.likedCount).toBe(2);
  });

  it('원본 배열을 건드리지 않는다 — B-2 의 불변 규칙이 그대로 살아 있다', () => {
    const { result } = renderHook(() => useLikeToggle(feedPosts));
    const [first] = feedPosts;

    act(() => result.current.toggle(first.id));

    expect(feedPosts[0].liked).toBe(false);
    expect(feedPosts[0].likeCount).toBe(first.likeCount);
    expect(result.current.posts).not.toBe(feedPosts);
  });

  it('훅을 두 번 부르면 상태도 둘이다 — 로직을 나눠 쓰는 것이지 상태를 나눠 쓰는 게 아니다', () => {
    const { result } = renderHook(() => ({
      left: useLikeToggle(feedPosts),
      right: useLikeToggle(feedPosts),
    }));
    const [first] = feedPosts;

    act(() => result.current.left.toggle(first.id));

    expect(result.current.left.likedCount).toBe(2);
    expect(result.current.right.likedCount).toBe(1);
  });
});

// B-5 가 덧붙였던 회원가입 Section 은 C-1 에서 /signup 으로 떨어져 나갔다.
// 그래서 걷어낼 것이 애초에 없어졌고, 걷어내던 함수도 지웠다.
// (없는 것을 지우고 없다고 단언하면 그 단언은 아무것도 증명하지 못한다.)

// E-5 는 머리말에 화면 밝기 고르개를 덧붙였다. 견주기 전에 걷어낸다.
function withoutThemeToggle(html: string) {
  return html.replace(/<div class="[^"]*" role="group" aria-label="화면 밝기">.*?<\/div>/, '');
}

// E-1 은 제목에 font-bold 를, E-2 는 나머지를 토큰 유틸리티로 옮겼다.
// 둘 다 B-3 이후에 덧붙은 변화이므로 견주기 전에 옛 이름으로 되돌린다.

describe('HomePage — 훅으로 옮긴 뒤에도 화면과 동작이 그대로다', () => {
  it('첫 화면 HTML 이 옮기기 전과 글자 하나 안 다르다', () => {
    const before = renderToStaticMarkup(<AppBeforeHook />);
    const rendered = renderToStaticMarkup(<HomePage />);
    const after = withoutThemeToggle(toB3Classes(rendered));

    // 잘라낸 뒤에도 비교할 알맹이가 남아 있어야 한다
    expect(after).toContain('aria-label="피드"');
    expect(after).not.toContain('aria-label="화면 밝기"');
    // 되돌리기가 실제로 걸렸는지 — 안 걸리면 이 비교는 아무것도 증명하지 못한다
    expect(b3BridgeHits(rendered)).toContain('feed');
    expect(b3BridgeHits(rendered)).toContain('post-card');
    expect(after).not.toContain('font-bold');
    // E-6 에서 카드 몸통이 들여온 Card 로 바뀌어 감싸는 칸이 늘었다.
    // "글자 하나 안 다르다" 는 더 못 지키므로, B-3 이 주장하던 것 —
    // 훅으로 옮겨도 학생이 보는 내용이 같다는 쪽만 남겨 견준다.
    expect(toVisibleText(after)).toBe(toVisibleText(toB3Classes(before)));
  });

  it('좋아요를 누르면 머리말 숫자가 함께 올라간다', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    expect(screen.getByText('좋아요 누른 게시물 1개')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '좋아요', pressed: false }));

    expect(screen.getByText('좋아요 누른 게시물 2개')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '좋아요', pressed: true })).toHaveLength(2);
  });

  it('옮기기 전 App 도 같은 방식으로 동작한다', async () => {
    const user = userEvent.setup();
    render(<AppBeforeHook />);

    await user.click(screen.getByRole('button', { name: '좋아요', pressed: false }));

    expect(screen.getByText('좋아요 누른 게시물 2개')).toBeInTheDocument();
  });
});
