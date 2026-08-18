// apps/web-spa/src/components/c7-escape-hatch.test.tsx
// C-7 Step 5 — 컴파일러가 있어도 손으로 써야 하는 한 자리 (내부 검증용)
//
// 공식 가이드가 지목하는 탈출구는 "effect 의존성으로 들어가는 값" 이다.
// 컴파일러의 기준은 신원이고, effect 가 알고 싶은 것은 뜻이 바뀌었는지다.
// 그 둘이 어긋나는 자리를 실제로 재둔다.
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { LikedSyncByCompiler, LikedSyncByUseMemo } from '../../scratch/c7-effect-dep-demo';
import { allPosts } from '../data/feed';
import type { Post } from '../types/instagram';

// 서버에서 같은 내용을 다시 받아온 상황 — 내용은 같고 배열만 새것이다
function sameContentNewArray(posts: Post[]): Post[] {
  return posts.map((post) => ({ ...post }));
}

type Variant = typeof LikedSyncByCompiler;

// 같은 내용을 세 번 다시 받아오는 동안 effect 가 몇 번 도는지 센다
function countSyncs(Variant: Variant) {
  const calls: number[][] = [];
  const onSync = (ids: number[]) => calls.push(ids);
  const base = allPosts.slice(0, 4);

  function Harness() {
    const [posts, setPosts] = useState(base);

    return (
      <>
        <Variant posts={posts} onSync={onSync} />
        <button onClick={() => setPosts((current) => sameContentNewArray(current))}>
          다시 받아오기
        </button>
      </>
    );
  }

  const view = render(<Harness />);
  const refetch = view.getByRole('button', { name: '다시 받아오기' });

  return {
    calls,
    refetch: () => fireEvent.click(refetch),
  };
}

describe('C-7 — 컴파일러가 대신 못 해주는 자리', () => {
  it('★ 내용이 같은데도 다시 받아올 때마다 effect 가 돈다', () => {
    const { calls, refetch } = countSyncs(LikedSyncByCompiler);

    expect(calls).toHaveLength(1);

    refetch();
    refetch();
    refetch();

    // 좋아요 목록은 처음부터 끝까지 한 번도 안 바뀌었다
    expect(new Set(calls.map((ids) => ids.join(',')))).toHaveLength(1);
    // 그런데 effect 는 네 번 돌았다
    expect(calls).toHaveLength(4);
  });

  it('★ 무엇을 "바뀐 것" 으로 칠지 우리가 정하면 한 번만 돈다', () => {
    const { calls, refetch } = countSyncs(LikedSyncByUseMemo);

    expect(calls).toHaveLength(1);

    refetch();
    refetch();
    refetch();

    expect(calls).toHaveLength(1);
  });

  it('진짜로 바뀌면 그때는 돈다 — 아예 멈춰 세운 게 아니다', () => {
    const calls: number[][] = [];
    const onSync = (ids: number[]) => calls.push(ids);
    const base = allPosts.slice(0, 4);

    function Harness() {
      const [posts, setPosts] = useState(base);

      return (
        <>
          <LikedSyncByUseMemo posts={posts} onSync={onSync} />
          <button
            onClick={() =>
              setPosts((current) =>
                current.map((post, index) => (index === 0 ? { ...post, liked: !post.liked } : post)),
              )
            }
          >
            첫 게시물 좋아요 뒤집기
          </button>
        </>
      );
    }

    const view = render(<Harness />);

    fireEvent.click(view.getByRole('button', { name: '첫 게시물 좋아요 뒤집기' }));

    expect(calls).toHaveLength(2);
    expect(calls[0].join(',')).not.toBe(calls[1].join(','));
  });
});
