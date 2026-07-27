// apps/web-spa/src/App.tsx
import { Feed } from './components/Feed';
import { Section } from './components/Section';
import { feedPosts } from './data/feed';
import { useLikeToggle } from './hooks/useLikeToggle';

export function App() {
  const { posts, likedCount, toggle } = useLikeToggle(feedPosts);

  return (
    <main className="feed">
      <header className="feed-header">
        <h1 className="feed-title">인스타그램</h1>
        <span className="feed-liked-count">좋아요 누른 게시물 {likedCount}개</span>
      </header>
      <Section title="피드">
        <Feed posts={posts} onToggleLike={toggle} />
      </Section>
    </main>
  );
}
