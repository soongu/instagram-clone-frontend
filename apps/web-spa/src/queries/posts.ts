// apps/web-spa/src/queries/posts.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import type { Post } from '../types/instagram';
import { fetchFeed, fetchTags, likePost } from '../api/posts';
import { toggleLike } from '../lib/likes';

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

    // 서버에 물어보기 *전에* 먼저 창고를 바꾼다. 화면은 창고를 그리니까
    // 누른 순간 하트가 빨개진다.
    onMutate: async (postId, context) => {
      // 지금 나가 있는 피드 요청을 세운다. 안 세우면 그 늦은 답이
      // 우리가 방금 바꾼 것을 옛 값으로 덮어쓴다.
      await context.client.cancelQueries({ queryKey: feedKey() });

      // B-2 에서 만든 그 함수다. 창고 안의 배열에도 똑같이 쓴다.
      context.client.setQueryData<Post[]>(feedKey(), (previous) =>
        previous === undefined ? previous : toggleLike(previous, postId),
      );
    },

    // 쓰고 나면 읽어둔 것이 낡는다.
    // 무효화는 "지우기" 가 아니라 "다시 물어보기" 다 — 화면은 안 비고,
    // 새 답이 오면 그때 갈린다. staleTime 이 남아 있어도 이건 나간다.
    onSuccess: (_result, _postId, _onMutateResult, context) => {
      void context.client.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
