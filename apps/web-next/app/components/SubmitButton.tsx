// apps/web-next/app/components/SubmitButton.tsx
'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

// 이 버튼은 자기가 어느 폼 안에 있는지 모른다. 그런데 그 폼이 보내는 중인지는 안다.
// useFormStatus 는 인자를 안 받고, 자기를 감싼 부모 폼의 상태를 읽어온다.
export function SubmitButton({
  children,
  pendingLabel,
  pressed,
  className,
}: {
  children: ReactNode;
  pendingLabel: string;
  pressed?: boolean;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-pressed={pressed} disabled={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}
