// apps/web-next/app/actions/session.ts
'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { APIError } from 'better-auth/api';
import { auth } from '@/lib/auth';

export type SignInState = { message: string | null };

// 이 파일의 함수들은 브라우저가 부르지만 몸통은 서버에서만 돈다.
// 비밀번호는 이 안에서만 다뤄지고 브라우저로 되돌아가지 않는다.
export async function signIn(previous: SignInState, formData: FormData): Promise<SignInState> {
  const username = formData.get('username');
  const password = formData.get('password');
  const next = formData.get('next');

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

  // 막혀서 온 사람이면 원래 가려던 곳으로 보낸다.
  // redirect 는 값을 돌려주는 대신 던진다 — 이 아래는 실행되지 않는다.
  const destination = insideOurApp(next);
  if (destination !== null) {
    // 타입 검사는 "진짜 있는 주소" 목록과 대조하는데, 이 값은 요청 때 정해져서 대조할 수가 없다.
    // 우리가 바로 위에서 확인했다는 것을 타입은 모르므로 여기서만 단언한다.
    redirect(destination as Route);
  }

  return { message: null };
}

// 이 주소가 우리 앱 안인지 판단한다.
//
// 글자 모양으로 검사하면 뚫린다. "/" 로 시작하는지만 보면 "//evil.example.com" 이
// 통과하고(브라우저는 이것을 다른 사이트로 읽는다), 그것까지 막아도 역슬래시가 섞인
// "/\/evil.example.com" 이 남는다. 브라우저가 실제로 어디로 갈지는 주소를 풀어봐야 안다.
//
// 그래서 아무도 안 쓰는 이름에 붙여 풀어본 뒤, 그 이름 그대로면 우리 앱 안이라고 본다.
// 바깥으로 나가는 주소는 붙이는 순간 다른 이름이 되어 걸린다.
const INTERNAL_BASE = 'http://internal.invalid';

function insideOurApp(next: FormDataEntryValue | null): string | null {
  if (typeof next !== 'string' || next === '') {
    return null;
  }

  try {
    const resolved = new URL(next, INTERNAL_BASE);
    if (resolved.origin !== INTERNAL_BASE) {
      return null;
    }
    return resolved.pathname + resolved.search;
  } catch {
    return null;
  }
}

export async function signOut() {
  // 어느 세션을 지울지는 요청에 실려온 쿠키를 봐야 안다.
  await auth.api.signOut({ headers: await headers() });
}
