// apps/web-next/app/[username]/layout.tsx
import { notFound } from 'next/navigation';
import { isKnownUser, postsByUsername } from '@/lib/posts';

// 이 껍데기는 프로필 주소에만 씌워진다.
// 바깥 껍데기(app/layout.tsx)는 그대로 있고, 그 안에 한 겹이 더 생긴다.
export default async function ProfileLayout({ children, params }: LayoutProps<'/[username]'>) {
  const { username } = await params;

  // 모르는 사람이면 여기서 멈춘다 — 게시물 0장으로 그리면 안 된다.
  if (!isKnownUser(username)) {
    notFound();
  }

  const posts = postsByUsername(username);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center gap-4">
        <div className="size-16 rounded-full bg-black/10" />
        <div>
          <h1 className="text-xl font-bold">@{username}</h1>
          <p className="mt-1 text-sm text-black/60">게시물 {posts.length}</p>
        </div>
      </div>
      {children}
    </main>
  );
}
