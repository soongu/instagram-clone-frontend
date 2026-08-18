// apps/web-next/app/components/FeedList.tsx
import { LikeButton } from './LikeButton';
import { fetchPosts } from '@/lib/api';

// 지시어가 없다. 그러니 서버 컴포넌트다.
// 서버에서 도니까 함수 안에서 그냥 기다렸다 받으면 된다 — 훅도, 상태도 없다.
export async function FeedList() {
  const posts = await fetchPosts();

  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li key={post.id} className="rounded border border-black/10 p-4">
          <p className="font-semibold">@{post.username}</p>
          <p className="mt-1">{post.content}</p>
          <LikeButton likeCount={post.likeCount} liked={post.liked} />
        </li>
      ))}
    </ul>
  );
}
