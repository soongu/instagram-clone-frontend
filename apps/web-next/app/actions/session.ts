// apps/web-next/app/actions/session.ts
'use server';

import { headers } from 'next/headers';
import { APIError } from 'better-auth/api';
import { auth } from '@/lib/auth';

export type SignInState = { message: string | null };

// 이 파일의 함수들은 브라우저가 부르지만 몸통은 서버에서만 돈다.
// 비밀번호는 이 안에서만 다뤄지고 브라우저로 되돌아가지 않는다.
export async function signIn(previous: SignInState, formData: FormData): Promise<SignInState> {
  const username = formData.get('username');
  const password = formData.get('password');

  if (typeof username !== 'string' || typeof password !== 'string') {
    return { message: '아이디와 비밀번호를 입력해주세요' };
  }

  try {
    // 성공하면 서명된 세션 쿠키가 응답에 실린다.
    await auth.api.signInUsername({ body: { username, password } });
  } catch (error) {
    // 아이디가 없을 때와 비밀번호가 틀릴 때가 같은 답이다.
    // 어느 쪽인지 알려주면 "이 아이디는 있다" 는 것을 알려주는 셈이 된다.
    if (error instanceof APIError) {
      return { message: '아이디 또는 비밀번호가 올바르지 않아요' };
    }
    throw error;
  }

  return { message: null };
}

export async function signOut() {
  // 어느 세션을 지울지는 요청에 실려온 쿠키를 봐야 안다.
  await auth.api.signOut({ headers: await headers() });
}
