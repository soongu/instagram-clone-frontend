// apps/web-next/app/actions/signup.ts
'use server';

import { APIError } from 'better-auth/api';
import { auth } from '@/lib/auth';

export type SignUpState = { message: string | null };

// 가입은 로그인과 모양이 거의 같다. 다만 계정을 만드는 쪽이라
// 무엇이 잘못됐는지를 숨기지 않고 알려준다 — 아직 아무의 계정도 아니기 때문이다.
export async function signUp(previous: SignUpState, formData: FormData): Promise<SignUpState> {
  const username = formData.get('username');
  const password = formData.get('password');

  if (typeof username !== 'string' || typeof password !== 'string') {
    return { message: '아이디와 비밀번호를 입력해주세요' };
  }

  try {
    await auth.api.signUpEmail({
      body: { email: `${username}@example.com`, password, name: username, username },
    });
  } catch (error) {
    // 라이브러리가 주는 사유는 영어라 화면에 그대로 내보내지 않는다.
    if (error instanceof APIError) {
      return { message: reasonInKorean(error.body?.code) };
    }
    throw error;
  }

  return { message: null };
}

// 이름은 라이브러리가 정한다. 짐작해서 적으면 아무 일도 안 일어난 것처럼
// 맨 아래로 떨어지므로, 실제로 돌려주는 값을 보고 적는다.
function reasonInKorean(code: string | undefined): string {
  switch (code) {
    case 'USERNAME_IS_ALREADY_TAKEN':
      return '이미 쓰고 있는 아이디예요';
    case 'USERNAME_TOO_SHORT':
      return '아이디는 세 글자 이상이어야 해요';
    case 'INVALID_USERNAME':
      return '아이디에는 영문과 숫자만 쓸 수 있어요';
    case 'PASSWORD_TOO_SHORT':
      return '비밀번호는 여덟 글자 이상이어야 해요';
    default:
      return '가입하지 못했어요';
  }
}
