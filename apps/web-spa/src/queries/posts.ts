// apps/web-spa/src/queries/posts.ts
import { useQuery } from '@tanstack/react-query';
import { fetchFeed, fetchTags } from '../api/posts';

// 키는 이 데이터의 이름이다. 캐시에서 이 이름으로 찾는다.
//
// 무엇을 달라고 했는지가 키에 함께 들어가야 한다.
// tag 를 빼놓으면 태그를 바꿔도 캐시는 "같은 것" 이라고 판단한다.
export function feedKey(tag?: string) {
  return tag === undefined ? (['posts'] as const) : (['posts', { tag }] as const);
}

export const tagsKey = ['tags'] as const;

export function useFeedQuery(tag?: string) {
  return useQuery({
    queryKey: feedKey(tag),
    queryFn: () => fetchFeed(tag),
  });
}

export function useTagsQuery() {
  return useQuery({
    queryKey: tagsKey,
    queryFn: fetchTags,
  });
}
