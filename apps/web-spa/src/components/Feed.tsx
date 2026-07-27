// apps/web-spa/src/components/Feed.tsx
import { feedPosts } from '../data/feed';
import { PostCard } from './PostCard';

export function Feed() {
  return (
    <>
      {feedPosts.map((post) => (
        <PostCard key={post.id} {...post} />
      ))}
    </>
  );
}
