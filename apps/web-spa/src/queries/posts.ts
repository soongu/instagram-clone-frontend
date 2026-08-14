// apps/web-spa/src/queries/posts.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchFeed, fetchTags, likePost } from '../api/posts';

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

// 읽기와 쓰기는 성질이 다르다. 읽기는 화면이 뜨면 알아서 나가지만
// 쓰기는 사람이 누를 때만 나가야 하고, 두 번 누르면 두 번 나가야 한다.
// 그래서 키도 없고, 부르는 함수(mutate)가 따로 있다.
export function useLikeMutation() {
  return useMutation({
    mutationFn: likePost,

    // 쓰고 나면 읽어둔 것이 낡는다.
    // 무효화는 "지우기" 가 아니라 "다시 물어보기" 다 — 화면은 안 비고,
    // 새 답이 오면 그때 갈린다. staleTime 이 남아 있어도 이건 나간다.
    onSuccess: (_result, _postId, _onMutateResult, context) => {
      void context.client.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
