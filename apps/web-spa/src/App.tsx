// apps/web-spa/src/App.tsx
import { useState } from 'react';
import { Feed } from './components/Feed';
import { Section } from './components/Section';
import { feedPosts } from './data/feed';
import { toggleLike } from './lib/likes';

export function App() {
  const [posts, setPosts] = useState(feedPosts);
  const likedCount = posts.filter((post) => post.liked).length;

  function handleToggleLike(id: number) {
    setPosts(toggleLike(posts, id));
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
    </main>
  );
}
