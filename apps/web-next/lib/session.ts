// apps/web-next/lib/session.ts
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

/**
 * 지금 요청을 보낸 사람. 로그인 안 했으면 null.
 *
 * 액션은 신원을 오직 이 함수로만 얻는다. 인자로 받은 이름은 절대 신원이 아니다 —
 * 그 값은 브라우저를 한 번 다녀온 값이라 누구든 고쳐 보낼 수 있다.
 */
export async function currentUser(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.username ?? null;
}
