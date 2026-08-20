// apps/web-next/app/components/SignUpFields.tsx
'use client';

import { useActionState } from 'react';
import { signUp, type SignUpState } from '@/app/actions/signup';
import { SubmitButton } from './SubmitButton';

const initial: SignUpState = { message: null };

export function SignUpFields() {
  const [state, formAction] = useActionState(signUp, initial);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-black/60">아이디</span>
        <input
          name="username"
          autoComplete="username"
          className="rounded border border-black/15 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-black/60">비밀번호</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          className="rounded border border-black/15 px-3 py-2"
        />
      </label>
      <SubmitButton
        pendingLabel="만드는 중…"
        className="rounded border border-black/15 px-3 py-2 disabled:opacity-40"
      >
        가입하기
      </SubmitButton>
      {state.message !== null && (
        <p aria-live="polite" className="text-black/60">
          {state.message}
        </p>
      )}
    </form>
  );
}
