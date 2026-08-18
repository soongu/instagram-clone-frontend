// apps/web-next/app/[username]/layout.tsx
import { notFound } from 'next/navigation';
import { findProfile } from '@/lib/api';

// 이 껍데기는 프로필 주소에만 씌워진다.
// 바깥 껍데기(app/layout.tsx)는 그대로 있고, 그 안에 한 겹이 더 생긴다.
//
// 여기서 서버에 물어보는 것은 딱 하나 — 이 사람이 있는가.
// 껍데기가 무언가를 기다리는 동안에는 아래쪽 loading.tsx 도 못 나간다.
// 이 주소는 아직 정적 껍데기를 못 만든다 — 기다렸다 내보내는 것을 허용한다.
// 왜 못 만드는지, 어떻게 넓히는지는 다음 시간에 다룬다.
export const instant = false;

export default async function ProfileLayout({ children, params }: LayoutProps<'/[username]'>) {
  const { username } = await params;

  // 모르는 사람이면 여기서 멈춘다 — 게시물 0장으로 그리면 안 된다.
  if ((await findProfile(username)) === null) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center gap-4">
        <div className="size-16 rounded-full bg-black/10" />
        <h1 className="text-xl font-bold">@{username}</h1>
      </div>
      {children}
    </main>
  );
}
