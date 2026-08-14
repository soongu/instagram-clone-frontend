// apps/web-spa/src/queries/posts.ts
import { useQuery } from '@tanstack/react-query';
import { fetchFeed } from '../api/posts';

// 키는 이 데이터의 이름이다. 캐시에서 이 이름으로 찾는다.
// 문자열이 아니라 배열인 이유는 Step 7 에서 파라미터가 붙기 때문이다.
export const feedKey = ['posts'] as const;

export function useFeedQuery() {
  return useQuery({
    queryKey: feedKey,
    queryFn: fetchFeed,
  });
}
