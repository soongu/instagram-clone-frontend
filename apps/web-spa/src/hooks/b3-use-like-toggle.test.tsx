// apps/web-spa/src/hooks/b3-use-like-toggle.test.tsx
// B-3 Step 6 — App 이 들고 있던 좋아요 로직을 훅으로 옮겨도 그대로인지 (내부 검증용)
import { render, screen, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { App } from '../App';
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

// B-5 에서 App 에 회원가입 Section 이 추가됐다. 이 테스트가 증명하려는 것은
// "좋아요 로직을 훅으로 옮겨도 피드 렌더 결과가 안 바뀐다" 이므로,
// 그 뒤에 App 에 덧붙은 부분은 빼고 견준다. 비교 대상 자체는 그대로다.
function withoutSignUpSection(html: string) {
  return html.replace(/<section class="section" aria-label="회원가입">.*?<\/section>/, '');
}

// E-1 에서 제목에 font-bold 유틸리티가 붙었다(Preflight 가 h1 굵기를 지운 것을 되돌린 것).
// 이것도 B-3 이후에 덧붙은 변화이므로 견주기 전에 걷어낸다.
function withoutE1Utilities(html: string) {
  return html.replace('class="feed-title font-bold"', 'class="feed-title"');
}

describe('App — 훅으로 옮긴 뒤에도 화면과 동작이 그대로다', () => {
  it('첫 화면 HTML 이 옮기기 전과 글자 하나 안 다르다', () => {
    const before = withoutSignUpSection(renderToStaticMarkup(<AppBeforeHook />));
    const after = withoutE1Utilities(withoutSignUpSection(renderToStaticMarkup(<App />)));

    // 잘라낸 뒤에도 비교할 알맹이가 남아 있어야 한다
    expect(after).toContain('aria-label="피드"');
    expect(after).not.toContain('aria-label="회원가입"');
    // 걷어내기가 실제로 걸렸는지 — 안 걸리면 이 비교는 아무것도 증명하지 못한다
    expect(renderToStaticMarkup(<App />)).toContain('class="feed-title font-bold"');
    expect(after).not.toContain('font-bold');
    expect(after).toBe(before);
  });

  it('좋아요를 누르면 머리말 숫자가 함께 올라간다', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('좋아요 누른 게시물 1개')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '♡ 좋아요' }));

    expect(screen.getByText('좋아요 누른 게시물 2개')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '♥ 좋아요 취소' })).toHaveLength(2);
  });

  it('옮기기 전 App 도 같은 방식으로 동작한다', async () => {
    const user = userEvent.setup();
    render(<AppBeforeHook />);

    await user.click(screen.getByRole('button', { name: '♡ 좋아요' }));

    expect(screen.getByText('좋아요 누른 게시물 2개')).toBeInTheDocument();
  });
});
