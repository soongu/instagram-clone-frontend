// apps/web-next/app/page.tsx
import { feedPosts } from '@/lib/posts';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-xl font-bold">피드</h1>
      <ul className="space-y-4">
        {feedPosts.map((post) => (
          <li key={post.id} className="rounded border border-black/10 p-4">
            <p className="font-semibold">@{post.username}</p>
            <p className="mt-1">{post.content}</p>
            <p className="mt-2 text-sm text-black/60">좋아요 {post.likeCount}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
