// apps/web-next/app/page.tsx
import { Suspense } from 'react';
import { FeedList } from '@/app/components/FeedList';

// 이 컴포넌트는 서버에서만 돈다. 브라우저로는 결과 글자만 간다.
export default function HomePage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-xl font-bold">피드</h1>
      {/* 피드는 굳히면 안 된다. 껍데기를 먼저 내보내고 목록은 요청 때 흘려보낸다. */}
      <Suspense fallback={<p className="text-sm text-black/40">피드를 불러오는 중…</p>}>
        <FeedList />
      </Suspense>
    </main>
  );
}
