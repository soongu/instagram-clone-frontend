// apps/web-next/app/components/SignInFields.tsx
'use client';

import { useActionState } from 'react';
import { signIn, type SignInState } from '@/app/actions/session';
import { SubmitButton } from './SubmitButton';

const initial: SignInState = { message: null };

export function SignInFields() {
  const [state, formAction] = useActionState(signIn, initial);

  return (
    <form action={formAction} className="ml-2 flex items-center gap-2">
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
  );
}
