// apps/web-next/app/components/LikeButton.tsx
'use client';

import { useActionState } from 'react';
import { toggleLike, type LikeState } from '@/app/actions/like';

// 이제 이 버튼은 화면 안에서만 숫자를 바꾸지 않는다.
// 누르면 서버까지 갔다 오고, 돌아온 값이 화면이 된다.
export function LikeButton({
  postId,
  likeCount,
  liked,
}: {
  postId: number;
  likeCount: number;
  liked: boolean;
}) {
  const initial: LikeState = { liked, likeCount, message: null };
  const [state, formAction, pending] = useActionState(toggleLike.bind(null, postId), initial);

  return (
    <form action={formAction}>
      <button
        type="submit"
        aria-pressed={state.liked}
        disabled={pending}
        className="mt-2 text-sm text-black/60 disabled:opacity-40"
      >
        {state.liked ? '♥' : '♡'} 좋아요 {state.likeCount}
        {pending ? ' (보내는 중…)' : ''}
      </button>
      {state.message !== null && (
        <p aria-live="polite" className="text-sm text-black/60">
          {state.message}
        </p>
      )}
    </form>
  );
}
