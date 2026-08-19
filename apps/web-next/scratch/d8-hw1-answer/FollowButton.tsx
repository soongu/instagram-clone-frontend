// apps/web-next/app/components/FollowButton.tsx
'use client';

import { useActionState, useOptimistic } from 'react';
import { follow, type FollowState } from '@/app/actions/follow';
import { SubmitButton } from './SubmitButton';

const initial: FollowState = { following: null, message: null };

export function FollowButton({ username }: { username: string }) {
  // 서버 함수에 이름을 미리 묶어두면 나머지 인자는 React 가 채운다.
  const [state, formAction] = useActionState(follow.bind(null, username), initial);

  // null 은 "아직 안 눌러봤다" 는 뜻이라 눌린 적 없는 것으로 보고 뒤집는다.
  const [optimistic, setOptimistic] = useOptimistic(state, (_previous, next: boolean) => ({
    following: next,
    message: null,
  }));

  return (
    <form
      action={() => {
        setOptimistic(optimistic.following !== true);
        return formAction();
      }}
      className="mb-4"
    >
      <SubmitButton className="rounded border border-black/15 px-3 py-1 text-sm disabled:opacity-40">
        {optimistic.following === true ? '팔로잉' : '팔로우'}
      </SubmitButton>
      {state.message !== null && (
        <p aria-live="polite" className="mt-1 text-sm text-black/60">
          {state.message}
        </p>
      )}
    </form>
  );
}
