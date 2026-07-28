// apps/web-spa/scratch/b4-story-answer.tsx
// 과제 1 답안 — 창 너비를 듣는 훅과 좁은 화면 안내.
import { useEffect, useState } from 'react';
import { Feed } from '../src/components/Feed';
import { Section } from '../src/components/Section';
import { feedPosts } from '../src/data/feed';
import { useLikeToggle } from '../src/hooks/useLikeToggle';

// 좁다고 볼 기준 너비
const NARROW_WIDTH = 640;

export function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

export function AppWithWidth() {
  const { posts, likedCount, toggle } = useLikeToggle(feedPosts);
  const width = useWindowWidth();
  // 안내를 띄울지는 너비로 계산되는 값이라 상태로 두지 않는다
  const isNarrow = width < NARROW_WIDTH;

  return (
    <main className="feed">
      <header className="feed-header">
        <h1 className="feed-title">인스타그램</h1>
        <span className="feed-liked-count">좋아요 누른 게시물 {likedCount}개</span>
        <span className="feed-width">너비 {width}px</span>
      </header>
      {isNarrow && <p className="narrow-notice">화면이 좁아요 · 가로로 넓히면 더 편해요</p>}
      <Section title="피드">
        <Feed posts={posts} onToggleLike={toggle} />
      </Section>
    </main>
  );
}
