// apps/web-next/app/[username]/layout.tsx
import { Suspense } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { findProfile } from '@/lib/api';

// 주소에서 이름을 꺼내 쓰는 일은 여기 안에서만 한다.
// 이 조각만 요청 때 채워지고, 바깥 껍데기는 미리 그려진 채로 남는다.
async function ProfileHeading({ params }: { params: LayoutProps<'/[username]'>['params'] }) {
  const { username } = await params;

  // 모르는 사람이면 여기서 멈춘다 — 게시물 0장으로 그리면 안 된다.
  const profile = await findProfile(username);
  if (profile === null) {
    notFound();
  }

  return (
    <>
      <Image
        src={profile.profileImageUrl}
        alt={`${username} 프로필 사진`}
        width={64}
        height={64}
        className="size-16 rounded-full object-cover"
      />
      <h1 className="text-xl font-bold">@{username}</h1>
    </>
  );
}

// 이 껍데기는 프로필 주소에만 씌워진다.
// 바깥 껍데기(app/layout.tsx)는 그대로 있고, 그 안에 한 겹이 더 생긴다.
//
// 이제 이 함수는 async 가 아니다. 기다릴 것이 없으니 통째로 미리 그려진다.
export default function ProfileLayout({ children, params }: LayoutProps<'/[username]'>) {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center gap-4">
        <Suspense
          fallback={
            <>
              <div className="size-16 animate-pulse rounded-full bg-black/5" />
              <div className="h-7 w-40 animate-pulse rounded bg-black/5" />
            </>
          }
        >
          <ProfileHeading params={params} />
        </Suspense>
      </div>
      {children}
    </main>
  );
}
