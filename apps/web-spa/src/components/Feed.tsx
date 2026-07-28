// apps/web-spa/src/components/Feed.tsx
import type { Post } from '../types/instagram';
import { List } from './List';
import { PostCard } from './PostCard';

interface FeedProps {
  posts: Post[];
  onToggleLike: (id: number) => void;
}

// 댓글 목록과 하는 일이 같아서 같은 컴포넌트를 쓴다.
// 담기는 것이 Post 라는 것만 다르다.
export function Feed({ posts, onToggleLike }: FeedProps) {
  return (
    <List
      items={posts}
      className="feed-list"
      aria-label="피드 목록"
      renderItem={(post) => <PostCard {...post} onToggleLike={onToggleLike} />}
    />
  );
}
