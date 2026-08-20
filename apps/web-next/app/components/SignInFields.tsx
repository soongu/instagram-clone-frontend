// apps/web-next/app/components/SignInFields.tsx
'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn, signInWithGitHub, type SignInState } from '@/app/actions/session';
import { SubmitButton } from './SubmitButton';

const initial: SignInState = { message: null };

export function SignInFields() {
  const [state, formAction] = useActionState(signIn, initial);
  // 문지기가 주소에 실어 보낸 값. 막힌 적이 없으면 없다.
  const next = useSearchParams().get('next');

  return (
    <div className="ml-2 flex items-center gap-2">
      <form action={formAction} className="flex items-center gap-2">
        {next !== null && <input type="hidden" name="next" value={next} />}
        <input
          name="username"
          aria-label="아이디"
          placeholder="아이디"
          autoComplete="username"
          className="w-24 rounded border border-black/15 px-2 py-1"
        />
        <input
          name="password"
          type="password"
          aria-label="비밀번호"
          placeholder="비밀번호"
          autoComplete="current-password"
          className="w-24 rounded border border-black/15 px-2 py-1"
        />
        <SubmitButton
          pendingLabel="확인 중…"
          className="rounded border border-black/15 px-2 py-1 disabled:opacity-40"
        >
          로그인
        </SubmitButton>
        {state.message !== null && (
          <p aria-live="polite" className="text-black/60">
            {state.message}
          </p>
        )}
      </form>
      {/* 아이디·비밀번호 폼과 목적지가 달라서 폼을 따로 둔다. 폼 하나에 보낼 곳은 하나다. */}
      <form action={signInWithGitHub}>
        <button type="submit" className="rounded border border-black/15 px-2 py-1">
          GitHub 으로 계속하기
        </button>
      </form>
    </div>
  );
}
