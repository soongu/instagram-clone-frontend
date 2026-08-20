// apps/web-next/app/components/CommentForm.tsx
'use client';

import { useActionState } from 'react';
import { addComment, type CommentState } from '@/app/actions/comment';
import { SubmitButton } from './SubmitButton';

const initial: CommentState = { message: null };

export function CommentForm({ postId }: { postId: number }) {
  // 어느 게시물인지는 미리 묶어둔다. 나머지 두 인자는 React 가 채운다.
  const [state, formAction] = useActionState(addComment.bind(null, postId), initial);

  return (
    <form action={formAction} className="mt-2 flex gap-2">
      <label htmlFor={`comment-${postId}`} className="sr-only">
        댓글 달기
      </label>
      <input
        id={`comment-${postId}`}
        name="content"
        placeholder="댓글 달기…"
        className="flex-1 border-b border-black/15 py-1 text-sm outline-none"
      />
      <SubmitButton pendingLabel="다는 중…" className="text-sm font-semibold disabled:opacity-40">
        게시
      </SubmitButton>
      {state.message !== null && (
        <p aria-live="polite" className="text-sm text-black/60">
          {state.message}
        </p>
      )}
    </form>
  );
}
