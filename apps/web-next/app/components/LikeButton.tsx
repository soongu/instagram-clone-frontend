// apps/web-next/app/components/LikeButton.tsx
'use client';

import { useActionState, useOptimistic } from 'react';
import { toggleLike, type LikeState } from '@/app/actions/like';
import { SubmitButton } from './SubmitButton';

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
  const [state, formAction] = useActionState(toggleLike.bind(null, postId), initial);

  // 첫 인자는 진짜 값, 둘째 인자는 "이렇게 될 거예요" 를 만드는 함수다.
  // 여기서 만든 값은 액션이 도는 동안만 살고, 끝나면 다시 state 로 돌아간다.
  const [optimistic, setOptimistic] = useOptimistic(state, (previous, next: boolean) => ({
    liked: next,
    likeCount: previous.likeCount + (next ? 1 : -1),
    message: null,
  }));

  return (
    <form
      action={() => {
        // 먼저 화면을 바꿔놓고
        setOptimistic(!optimistic.liked);
        // 그다음에 서버로 보낸다
        return formAction();
      }}
    >
      <SubmitButton
        pressed={optimistic.liked}
        className="mt-2 text-sm text-black/60 disabled:opacity-40"
      >
        {optimistic.liked ? '♥' : '♡'} 좋아요 {optimistic.likeCount}
      </SubmitButton>
      {state.message !== null && (
        <p aria-live="polite" className="text-sm text-black/60">
          {state.message}
        </p>
      )}
    </form>
  );
}
