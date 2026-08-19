// apps/web-next/app/actions/session.ts
'use server';

import { cookies } from 'next/headers';

// 이 파일의 함수들은 브라우저가 부르지만 몸통은 서버에서만 돈다.
// 폼이 제출되면 Next 가 여기까지 값을 실어 나른다.
export async function signIn(formData: FormData) {
  const username = formData.get('username');

  if (typeof username !== 'string' || username === '') {
    return;
  }

  // httpOnly 라 브라우저 자바스크립트는 이 값을 못 읽는다. 서버만 본다.
  (await cookies()).set('me', username, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24,
  });
}

export async function signOut() {
  (await cookies()).delete('me');
}
