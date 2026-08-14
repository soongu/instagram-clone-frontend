// apps/web-spa/src/routes/HomePage.tsx
import { FeedSection } from '../components/FeedSection';
import { useFeedQuery } from '../queries/posts';

export function HomePage() {
  // 갈래가 또 하나 줄었다. 실패는 이제 이 화면이 처리하지 않는다.
  //
  // 그런데 타입은 아직 실패를 안다 — 위로 던지기로 한 것은 우리 약속이지
  // 타입이 아는 사실이 아니다. 그래서 "성공했을 때만" 이라고 물어본다.
  const { data: posts, isSuccess } = useFeedQuery();

  if (!isSuccess) {
    return <p className="text-sm text-faint">피드를 불러오는 중이에요…</p>;
  }

  return <FeedSection posts={posts} />;
}
