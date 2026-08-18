// apps/web-spa/src/components/c7-auto-memo.test.tsx
// C-7 Step 3 — 컴파일러가 실제로 멈춰 세우는 자리 (내부 검증용)
//
// 캡션을 펼치는 것은 PostBody 자기 상태다. 그 옆의 하트와 모달은
// 받는 값이 하나도 안 바뀐다. 컴파일러가 JSX 를 캐시해 두면 형제는 안 그려진다.
//
// ⚠️ 이 판은 컴파일러가 켜져 있어야 초록이다. vite.config.ts 에서 프리셋을 빼면
//    아래 0 이 전부 1 이 된다 — 그것이 이 판의 존재 이유다.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withRouter } from '../../scratch/c1-router-harness';
import { allPosts } from '../data/feed';

const likeRenders: string[] = [];
const modalRenders: string[] = [];

vi.mock('./LikeButton', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./LikeButton')>();
  const Original = mod.LikeButton;
  return {
    LikeButton: (props: Parameters<typeof Original>[0]) => {
      likeRenders.push(`like:${props.likeCount}`);
      return <Original {...props} />;
    },
  };
});

vi.mock('./PostModal', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./PostModal')>();
  const Original = mod.PostModal;
  return {
    PostModal: (props: Parameters<typeof Original>[0]) => {
      modalRenders.push(`modal:${props.username}`);
      return <Original {...props} />;
    },
  };
});

function renderBody() {
  const post = allPosts[0];
  return render(
    withRouter(
      <PostBodyUnderTest
        id={post.id}
        username={post.username}
        profileImageUrl={post.profileImageUrl}
        imageUrl={post.imageUrl}
        content={post.content}
        liked={post.liked}
        likeCount={post.likeCount}
        commentCount={post.commentCount}
        onToggle={() => {}}
      />,
    ),
  );
}

// 모의가 걸린 뒤에 불러와야 해서 최상단 import 를 못 쓴다
const { PostBody: PostBodyUnderTest } = await import('./PostBody');

describe('C-7 — 형제는 다시 안 그려진다', () => {
  beforeEach(() => {
    likeRenders.length = 0;
    modalRenders.length = 0;
  });

  it('첫 그림에는 하트도 모달도 한 번씩 그려진다', () => {
    renderBody();

    expect(likeRenders).toHaveLength(1);
    expect(modalRenders).toHaveLength(1);
  });

  it('★ 캡션을 펼쳐도 하트와 모달은 다시 안 그려진다', async () => {
    const user = userEvent.setup();
    renderBody();

    likeRenders.length = 0;
    modalRenders.length = 0;

    await user.click(screen.getByRole('button', { name: '더 보기' }));
    await screen.findByRole('button', { name: '접기' });

    // 캡션은 실제로 펼쳐졌다 — 아무 일도 안 일어난 게 아니다
    expect(screen.getByText(allPosts[0].content, { exact: false })).toBeInTheDocument();

    // 그런데 형제는 한 번도 안 불렸다
    expect(likeRenders).toEqual([]);
    expect(modalRenders).toEqual([]);
  });

  it('접었다 펴기를 두 번 더 해도 형제는 0 그대로다', async () => {
    const user = userEvent.setup();
    renderBody();

    likeRenders.length = 0;
    modalRenders.length = 0;

    for (let i = 0; i < 2; i += 1) {
      await user.click(screen.getByRole('button', { name: '더 보기' }));
      await user.click(screen.getByRole('button', { name: '접기' }));
    }

    expect(likeRenders).toEqual([]);
    expect(modalRenders).toEqual([]);
  });
});
