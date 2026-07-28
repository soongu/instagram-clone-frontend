// apps/web-spa/scratch/a5-toast-before.tsx
// A-5 Step 4 비교용 — 알림을 문자열 하나로 들고 있던 B-4 시절의 App.
// 같은 문구가 연달아 뜰 때 타이머가 다시 걸리는지를 지금 판과 나란히 재려고 남긴다.
import { useEffect, useState } from 'react';
import { Feed } from '../src/components/Feed';
import { Section } from '../src/components/Section';
import { Toast } from '../src/components/Toast';
import { feedPosts } from '../src/data/feed';
import { useLikeToggle } from '../src/hooks/useLikeToggle';
import { useScrollRestore } from '../src/hooks/useScrollRestore';

const TOAST_DURATION = 3000;

export function AppStringToast() {
  const { posts, likedCount, toggle } = useLikeToggle(feedPosts);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useScrollRestore(() => {
    setToastMessage(`게시물을 모두 확인했습니다 · 좋아요 ${likedCount}개`);
  });

  useEffect(() => {
    document.title = `인스타그램 (좋아요 ${likedCount})`;
  }, [likedCount]);

  useEffect(() => {
    if (toastMessage === null) {
      return;
    }

    const timerId = setTimeout(() => setToastMessage(null), TOAST_DURATION);

    return () => clearTimeout(timerId);
  }, [toastMessage]);

  function handleToggleLike(id: number) {
    const target = posts.find((post) => post.id === id);
    toggle(id);

    if (target) {
      setToastMessage(
        target.liked
          ? `${target.username}님의 게시물 좋아요를 취소했습니다`
          : `${target.username}님의 게시물을 좋아합니다`,
      );
    }
  }

  return (
    <main className="feed">
      <header className="feed-header">
        <h1 className="feed-title">인스타그램</h1>
        <span className="feed-liked-count">좋아요 누른 게시물 {likedCount}개</span>
      </header>
      <Section title="피드">
        <Feed posts={posts} onToggleLike={handleToggleLike} />
      </Section>
      {toastMessage !== null && <Toast message={toastMessage} />}
    </main>
  );
}
