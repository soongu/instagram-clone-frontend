// apps/web-spa/src/components/Feed.tsx
import type { Post } from '../types/instagram';
import { PostCard } from './PostCard';

interface FeedProps {
  posts: Post[];
  onToggleLike: (id: number) => void;
}

export function Feed({ posts, onToggleLike }: FeedProps) {
  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} {...post} onToggleLike={onToggleLike} />
      ))}
    </>
  );
}
