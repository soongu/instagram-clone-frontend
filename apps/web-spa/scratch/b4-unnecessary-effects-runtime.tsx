// apps/web-spa/scratch/b4-unnecessary-effects-runtime.tsx
// effect 로 상태를 맞추는 판과 렌더 중에 계산하는 판이 실행 중에 어떻게 갈리는지 재려고 남긴 파일이다.
// 린트가 먼저 막아버리면 실행까지 갈 수가 없어서 이 파일만 규칙을 끈다.
import { useEffect, useState } from 'react';
import type { Post } from '../src/types/instagram';
import { feedPosts } from '../src/data/feed';
import { toggleLike } from '../src/lib/likes';

// ① effect 로 맞추는 판 — 좋아요 개수를 상태로 또 두고 뒤늦게 채운다
export function DerivedByEffect() {
  const [posts, setPosts] = useState<Post[]>(feedPosts);
  const [likedCount, setLikedCount] = useState(0);

  useEffect(() => {
    setLikedCount(posts.filter((post) => post.liked).length);
  }, [posts]);

  return (
    <div>
      <p data-testid="count">좋아요 {likedCount}개</p>
      <button onClick={() => setPosts(toggleLike(posts, 1))}>토글</button>
    </div>
  );
}

// ② 렌더 중에 계산하는 판 — 상태는 하나뿐이다
export function DerivedInRender() {
  const [posts, setPosts] = useState<Post[]>(feedPosts);
  const likedCount = posts.filter((post) => post.liked).length;

  return (
    <div>
      <p data-testid="count">좋아요 {likedCount}개</p>
      <button onClick={() => setPosts(toggleLike(posts, 1))}>토글</button>
    </div>
  );
}

// ③ 사용자가 누른 결과를 effect 로 뒤늦게 감지해 알림을 띄우는 판
export function ToastByEffect({ initialLiked }: { initialLiked: boolean }) {
  const [liked, setLiked] = useState(initialLiked);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (liked) {
      setMessage('게시물을 좋아합니다');
    }
  }, [liked]);

  return (
    <div>
      <button onClick={() => setLiked(!liked)}>좋아요</button>
      <p data-testid="msg">{message}</p>
    </div>
  );
}

// ④ 누른 그 자리에서 띄우는 판
export function ToastByHandler({ initialLiked }: { initialLiked: boolean }) {
  const [liked, setLiked] = useState(initialLiked);
  const [message, setMessage] = useState('');

  function handleClick() {
    const next = !liked;
    setLiked(next);

    if (next) {
      setMessage('게시물을 좋아합니다');
    }
  }

  return (
    <div>
      <button onClick={handleClick}>좋아요</button>
      <p data-testid="msg">{message}</p>
    </div>
  );
}
