// apps/web-spa/src/components/PostComments.tsx
import { X } from 'lucide-react';
import { ApiError } from '../api/client';
import { useCommentsQuery, useDeleteCommentMutation } from '../queries/comments';
import { useConfirmStore } from '../stores/useConfirmStore';
import { IconButton } from './IconButton';
import { List } from './List';
import { Toast } from './Toast';

interface PostCommentsProps {
  postId: number;
}

// 서버에 있는 댓글을 그리고, 지우는 일까지 맡는다.
// 카드 안의 CommentList 는 아직 안 보낸 초안을 그리는 자리라 그대로 둔다.
export function PostComments({ postId }: PostCommentsProps) {
  const { data: comments, isPending, error } = useCommentsQuery(postId);
  const removeComment = useDeleteCommentMutation(postId);

  // C-4 에서 만든 그 상자다. 무엇을 물어볼지만 넘기면 된다.
  const ask = useConfirmStore((state) => state.ask);

  if (error !== null) {
    return <p className="px-3 text-sm text-danger-strong">댓글을 불러오지 못했어요</p>;
  }

  if (isPending) {
    return <p className="px-3 text-sm text-faint">댓글을 불러오는 중이에요…</p>;
  }

  return (
    <>
      <List
        items={comments}
        className="px-3 pb-3 text-sm"
        aria-label="댓글 목록"
        renderItem={(comment) => (
          <>
            <strong>{comment.username}</strong> {comment.content}
            <IconButton
              className="cursor-pointer p-1 text-sm leading-none text-faint hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              aria-label="댓글 삭제"
              onClick={() => ask('댓글을 지울까요?', () => removeComment.mutate(comment.id))}
            >
              <X className="size-4" />
            </IconButton>
          </>
        )}
      />
      {removeComment.isError && (
        <Toast
          message={
            removeComment.error instanceof ApiError
              ? removeComment.error.message
              : '댓글을 지우지 못했어요'
          }
        />
      )}
    </>
  );
}
