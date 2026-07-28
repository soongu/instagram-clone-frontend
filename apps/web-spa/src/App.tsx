// apps/web-spa/src/App.tsx
import { useEffect } from 'react';
import { Feed } from './components/Feed';
import { Section } from './components/Section';
import { Toast } from './components/Toast';
import { feedPosts } from './data/feed';
import { useFeed } from './hooks/useFeed';
import { useScrollRestore } from './hooks/useScrollRestore';

// 알림이 화면에 머무는 시간
const TOAST_DURATION = 3000;

export function App() {
  const { posts, likedCount, toast, toggleLike, reachBottom, dismissToast } = useFeed(feedPosts);

  // 피드 끝에 닿으면 여기까지 봤다고 알려준다
  useScrollRestore(reachBottom);

  // 브라우저 탭 제목은 React 가 그리는 화면 밖에 있다. 직접 맞춰줘야 한다.
  useEffect(() => {
    document.title = `인스타그램 (좋아요 ${likedCount})`;
  }, [likedCount]);

  // 알림을 띄웠으면 치우는 것까지가 한 일이다.
  useEffect(() => {
    if (toast === null) {
      return;
    }

    const timerId = setTimeout(dismissToast, TOAST_DURATION);

    return () => clearTimeout(timerId);
  }, [toast, dismissToast]);

  return (
    <main className="feed">
      <header className="feed-header">
        <h1 className="feed-title">인스타그램</h1>
        <span className="feed-liked-count">좋아요 누른 게시물 {likedCount}개</span>
      </header>
      <Section title="피드">
        <Feed posts={posts} onToggleLike={toggleLike} />
      </Section>
      {toast !== null && <Toast message={toast.message} />}
    </main>
  );
}
