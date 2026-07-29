// apps/web-spa/scratch/b6-step2-snapshot.ts
// B-6 Step 2 시점의 스키마 박제 — .refine 이 아직 안 붙은 중간 상태.
// 교안 Step 4 가 "비밀번호가 달라도 통과합니다" 라고 서술하는 근거다.
// 파일이 달라 이름 충돌이 없으므로 교안과 이름을 똑같이 둔다.
import { z } from 'zod';

const USERNAME_PATTERN = /^[a-z0-9._]{4,20}$/;

export const SignUpSchema = z.object({
  username: z
    .string()
    .min(1, { error: '사용자 이름을 입력해 주세요' })
    .regex(USERNAME_PATTERN, { error: '영문 소문자·숫자·마침표·밑줄로 4~20자여야 해요' }),
  email: z
    .string()
    .min(1, { error: '이메일을 입력해 주세요' })
    .pipe(z.email({ error: '이메일 모양이 아니에요' })),
  password: z
    .string()
    .min(1, { error: '비밀번호를 입력해 주세요' })
    .min(8, { error: '8자 이상이어야 해요' }),
  passwordConfirm: z.string().min(1, { error: '비밀번호를 한 번 더 입력해 주세요' }),
});

export type SignUpValues = z.infer<typeof SignUpSchema>;
