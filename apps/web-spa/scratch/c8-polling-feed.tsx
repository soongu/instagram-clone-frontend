// C-8 Step 1 의 폴링 화면.
//
// 본문에서는 useFeedQuery 에 refetchInterval 을 잠깐 붙였다 뗀다.
// 뗀 뒤에도 "그때 무슨 일이 있었는지" 를 계속 재려면 그 시점 화면이 남아 있어야 한다
// (C-5 의 c5-effect-fetch-before, C-7 의 c7-feed-section-before 와 같은 이유).
import { useQuery } from '@tanstack/react-query';
import { fetchFeed } from '../src/api/posts';
import { feedKey } from '../src/queries/posts';
import { FeedSection } from '../src/components/FeedSection';

export function useFeedQueryPolling(intervalMs: number, tag?: string) {
  return useQuery({
    queryKey: feedKey(tag),
    queryFn: () => fetchFeed(tag),

    // 이 한 줄이 폴링이다. 정해둔 간격마다 알아서 다시 물어본다.
    refetchInterval: intervalMs,
  });
}

export function HomePagePolling({ intervalMs }: { intervalMs: number }) {
  const { data: posts, isSuccess } = useFeedQueryPolling(intervalMs);

  if (!isSuccess) {
    return <p className="text-sm text-faint">피드를 불러오는 중이에요…</p>;
  }

  return <FeedSection posts={posts} />;
}
