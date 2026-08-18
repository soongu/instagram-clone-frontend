// apps/web-next/app/components/FeedList.tsx
import { LikeButton } from './LikeButton';
import { feedPosts } from '@/lib/posts';

// 지시어가 없다. 그러니 서버 컴포넌트다.
export function FeedList() {
  return (
    <ul className="space-y-4">
      {feedPosts.map((post) => (
        <li key={post.id} className="rounded border border-black/10 p-4">
          <p className="font-semibold">@{post.username}</p>
          <p className="mt-1">{post.content}</p>
          <LikeButton likeCount={post.likeCount} liked={post.liked} />
        </li>
      ))}
    </ul>
  );
}
