// apps/web-next/app/explore/page.tsx
import type { Metadata } from 'next';
import { allPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: '탐색 · 인스타그램 클론',
  openGraph: {
    title: '탐색',
    description: '요즘 많이 보는 게시물',
  },
};

export default function ExplorePage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-xl font-bold">탐색</h1>
      <ul className="grid grid-cols-3 gap-2">
        {allPosts.map((post) => (
          <li key={post.id} className="aspect-square rounded bg-black/5 p-3 text-sm">
            <p className="font-semibold">@{post.username}</p>
            <p className="mt-1 text-black/60">좋아요 {post.likeCount}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
