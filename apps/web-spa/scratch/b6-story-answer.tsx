// apps/web-spa/scratch/b6-story-answer.tsx
// B-6 과제 [구현] 예시답안 — 로그인 폼을 스키마로 옮기고, 댓글 응답 스키마를 만든다.
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../src/components/Button';
import { TextField } from '../src/components/TextField';

// ── lib/schemas.ts 에 추가하는 부분 ───────────────────────────

export const LoginSchema = z.object({
  username: z.string().min(1, { error: '사용자 이름을 입력해 주세요' }),
  password: z.string().min(1, { error: '비밀번호를 입력해 주세요' }),
});

export type LoginValues = z.infer<typeof LoginSchema>;

export const CommentSchema = z.object({
  id: z.number(),
  postId: z.number(),
  username: z.string(),
  content: z.string(),
  createdAt: z.string(),
});

export const CommentListSchema = z.array(CommentSchema);

// ── components/LoginForm.tsx ─────────────────────────────────

interface LoginFormProps {
  onSubmit: (values: LoginValues) => void | Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { username: '', password: '' },
  });

  return (
    <form className="signup-form" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        id="login-username"
        label="사용자 이름"
        error={errors.username?.message}
        {...register('username')}
      />

      <TextField
        id="login-password"
        label="비밀번호"
        type="password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button className="signup-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? '들어가는 중...' : '로그인'}
      </Button>
    </form>
  );
}
