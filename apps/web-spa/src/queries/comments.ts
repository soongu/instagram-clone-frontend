// apps/web-spa/src/queries/comments.ts
import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import type { Comment } from '../types/instagram';
import { deleteComment, fetchComments } from '../api/comments';

export function commentsQuery(postId: number) {
  return queryOptions({
    queryKey: ['posts', postId, 'comments'],
    queryFn: () => fetchComments(postId),
  });
}

export function useCommentsQuery(postId: number) {
  return useQuery(commentsQuery(postId));
}

// 좋아요와 같은 결이다 — 먼저 지우고, 거절당하면 되돌린다.
// 다른 점은 되돌릴 것이 숫자가 아니라 목록의 한 줄이라는 것뿐이다.
export function useDeleteCommentMutation(postId: number) {
  return useMutation({
    mutationFn: deleteComment,

    onMutate: async (commentId, context) => {
      const key = commentsQuery(postId).queryKey;

      await context.client.cancelQueries({ queryKey: key });

      const previous = context.client.getQueryData<Comment[]>(key);

      context.client.setQueryData<Comment[]>(key, (current) =>
        current?.filter((comment) => comment.id !== commentId),
      );

      return { previous };
    },

    onError: (_error, _commentId, onMutateResult, context) => {
      if (onMutateResult?.previous !== undefined) {
        context.client.setQueryData(commentsQuery(postId).queryKey, onMutateResult.previous);
      }
    },

    onSettled: (_result, _error, _commentId, _onMutateResult, context) => {
      void context.client.invalidateQueries({ queryKey: commentsQuery(postId).queryKey });
    },
  });
}
