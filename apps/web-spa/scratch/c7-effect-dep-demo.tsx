// apps/web-spa/scratch/c7-effect-dep-demo.tsx
//
// C-7 Step 5 — 컴파일러가 해결해주지 않는 한 가지.
//
// 컴파일러는 "값이 그대로면 지난번 것을 돌려준다" 로 렌더를 아낀다.
// 그런데 그 판단 기준은 신원(===)이다. 서버에서 같은 내용을 다시 받아오면
// 배열은 새것이라 파생값도 새로 만들어지고, 그것을 의존성으로 삼은 effect 가
// 뜻이 하나도 안 바뀌었는데 다시 돈다.
//
// 아래 둘은 화면이 똑같다. 갈리는 것은 effect 가 몇 번 도느냐뿐이다.
import { useEffect, useMemo } from 'react';
import type { Post } from '../src/types/instagram';

interface DemoProps {
  posts: Post[];
  onSync: (ids: number[]) => void;
}

// (1) 컴파일러에게 맡긴다 — 파생값은 posts 의 신원을 따라간다
export function LikedSyncByCompiler({ posts, onSync }: DemoProps) {
  const likedIds = posts.filter((post) => post.liked).map((post) => post.id);

  useEffect(() => {
    onSync(likedIds);
  }, [likedIds, onSync]);

  return <p>좋아요 {likedIds.length}개</p>;
}

// (2) 우리가 기준을 정한다 — 내용이 같으면 같은 것으로 친다
export function LikedSyncByUseMemo({ posts, onSync }: DemoProps) {
  const likedKey = posts
    .filter((post) => post.liked)
    .map((post) => post.id)
    .join(',');

  // 이 자리가 공식 문서가 말하는 탈출구다.
  // "무엇이 바뀐 것으로 칠지" 를 우리가 정해야 할 때만 손으로 쓴다.
  const likedIds = useMemo(
    () => (likedKey === '' ? [] : likedKey.split(',').map(Number)),
    [likedKey],
  );

  useEffect(() => {
    onSync(likedIds);
  }, [likedIds, onSync]);

  return <p>좋아요 {likedIds.length}개</p>;
}
