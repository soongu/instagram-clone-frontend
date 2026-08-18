// apps/web-next/app/page.tsx
import { LikeButton } from '@/app/components/LikeButton';
import { feedPosts } from '@/lib/posts';

// 이 컴포넌트는 서버에서만 돈다. 브라우저로는 결과 글자만 간다.
export default function HomePage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-xl font-bold">피드</h1>
      <ul className="space-y-4">
        {feedPosts.map((post) => (
          <li key={post.id} className="rounded border border-black/10 p-4">
            <p className="font-semibold">@{post.username}</p>
            <p className="mt-1">{post.content}</p>
            <LikeButton likeCount={post.likeCount} liked={post.liked} />
          </li>
        ))}
      </ul>
    </main>
  );
}
