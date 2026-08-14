// apps/web-spa/src/routes/HomePage.tsx
import { ApiError } from '../api/client';
import { FeedSection } from '../components/FeedSection';
import { useFeedQuery } from '../queries/posts';

export function HomePage() {
  // 세 갈래를 손으로 들고 있던 자리가 한 줄로 줄었다.
  const { data: posts, isPending, error } = useFeedQuery();

  if (error !== null) {
    return (
      <p className="text-sm text-danger-strong">
        {error instanceof ApiError ? error.message : '피드를 불러오지 못했어요'}
      </p>
    );
  }

  if (isPending) {
    return <p className="text-sm text-faint">피드를 불러오는 중이에요…</p>;
  }

  return <FeedSection posts={posts} />;
}
