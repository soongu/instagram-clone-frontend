// apps/web-spa/src/App.tsx
import { PostCard } from './components/PostCard';
import { feedPosts } from './data/feed';

const [firstPost, secondPost] = feedPosts;

export function App() {
  return (
    <main className="feed">
      <h1 className="feed-title">인스타그램</h1>
      <PostCard {...firstPost} />
      <PostCard {...secondPost} />
    </main>
  );
}
