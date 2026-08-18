// apps/web-next/app/page.tsx
import { FeedList } from '@/app/components/FeedList';

// 이 컴포넌트는 서버에서만 돈다. 브라우저로는 결과 글자만 간다.
export default function HomePage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-xl font-bold">피드</h1>
      <FeedList />
    </main>
  );
}
