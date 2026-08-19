// apps/web-next/app/components/SignInForm.tsx
import { cookies } from 'next/headers';
import { signIn, signOut } from '@/app/actions/session';

// 지시어가 없다. 서버 컴포넌트다 — 그런데 폼이 있고 버튼이 동작한다.
// 쿠키를 읽으니 이 조각은 요청 때 채워진다.
export async function SignInForm() {
  const me = (await cookies()).get('me')?.value;

  if (me !== undefined) {
    return (
      <form action={signOut} className="ml-2 flex items-center gap-2">
        <span className="text-black/60">@{me}</span>
        <button type="submit" className="rounded border border-black/15 px-2 py-1">
          나가기
        </button>
      </form>
    );
  }

  // 어느 버튼을 눌렀는지는 name/value 로 함께 실려 간다.
  return (
    <form action={signIn} className="ml-2 flex items-center gap-2">
      <button
        type="submit"
        name="username"
        value="jaehoon"
        className="rounded border border-black/15 px-2 py-1"
      >
        재훈으로 보기
      </button>
      <button
        type="submit"
        name="username"
        value="minji"
        className="rounded border border-black/15 px-2 py-1"
      >
        민지로 보기
      </button>
    </form>
  );
}
