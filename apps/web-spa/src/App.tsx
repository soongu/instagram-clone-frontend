// apps/web-spa/src/App.tsx
import { useEffect, useState } from 'react';
import { Feed } from './components/Feed';
import { Section } from './components/Section';
import { Toast } from './components/Toast';
import { feedPosts } from './data/feed';
import { useLikeToggle } from './hooks/useLikeToggle';

// 알림이 화면에 머무는 시간
const TOAST_DURATION = 3000;

export function App() {
  const { posts, likedCount, toggle } = useLikeToggle(feedPosts);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 브라우저 탭 제목은 React 가 그리는 화면 밖에 있다. 직접 맞춰줘야 한다.
  useEffect(() => {
    document.title = `인스타그램 (좋아요 ${likedCount})`;
  }, [likedCount]);

  // 알림을 띄웠으면 치우는 것까지가 한 일이다.
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
