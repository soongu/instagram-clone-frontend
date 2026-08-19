// apps/web-next/app/components/LikeButton.tsx
'use client';

import { useActionState } from 'react';
import { toggleLike, type LikeState } from '@/app/actions/like';
import { SubmitButton } from './SubmitButton';

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
  // 보내는 중인지는 버튼이 스스로 안다. 여기서는 더 받아올 것이 없다.
  const [state, formAction] = useActionState(toggleLike.bind(null, postId), initial);

  return (
    <form action={formAction}>
      <SubmitButton
        pressed={state.liked}
        pendingLabel="보내는 중…"
        className="mt-2 text-sm text-black/60 disabled:opacity-40"
      >
        {state.liked ? '♥' : '♡'} 좋아요 {state.likeCount}
      </SubmitButton>
      {state.message !== null && (
        <p aria-live="polite" className="text-sm text-black/60">
          {state.message}
        </p>
      )}
    </form>
  );
}
