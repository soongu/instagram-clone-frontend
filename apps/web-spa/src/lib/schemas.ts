// apps/web-spa/src/lib/schemas.ts
import { z } from 'zod';

// 백엔드가 받는 규칙과 같은 모양으로 맞췄다
const USERNAME_PATTERN = /^[a-z0-9._]{4,20}$/;

// 회원가입 폼이 받는 값 — 규칙이 화면 코드가 아니라 여기 모여 있다
export const SignUpSchema = z
  .object({
    username: z
      .string()
      .min(1, { error: '사용자 이름을 입력해 주세요' })
      .regex(USERNAME_PATTERN, { error: '영문 소문자·숫자·마침표·밑줄로 4~20자여야 해요' }),
    // 빈 칸 검사를 통과한 값만 이메일 모양 검사로 넘긴다
    email: z
      .string()
      .min(1, { error: '이메일을 입력해 주세요' })
      .pipe(z.email({ error: '이메일 모양이 아니에요' })),
    password: z
      .string()
      .min(1, { error: '비밀번호를 입력해 주세요' })
      .min(8, { error: '8자 이상이어야 해요' }),
    passwordConfirm: z.string().min(1, { error: '비밀번호를 한 번 더 입력해 주세요' }),
  })
  // 이 칸 하나만 봐서는 알 수 없다 — 옆 칸을 같이 봐야 한다
  .refine((values) => values.password === values.passwordConfirm, {
    error: '비밀번호가 일치하지 않아요',
    path: ['passwordConfirm'],
  });

// 스키마에서 타입이 나온다 — 필드 이름을 다시 적지 않는다
export type SignUpValues = z.infer<typeof SignUpSchema>;
