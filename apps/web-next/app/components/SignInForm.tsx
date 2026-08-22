// apps/web-next/app/components/SignInForm.tsx
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { signOut } from '@/app/actions/session';
import { SignInFields } from './SignInFields';

// 지시어가 없다. 서버 컴포넌트다 — 세션을 서버에서 직접 확인한다.
export async function SignInForm() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session !== null) {
    return (
      <form action={signOut} className="ms-2 flex items-center gap-2">
        <span className="text-black/60">@{session.user.username}</span>
        <button type="submit" className="rounded border border-black/15 px-2 py-1">
          나가기
        </button>
      </form>
    );
  }

  return <SignInFields />;
}
