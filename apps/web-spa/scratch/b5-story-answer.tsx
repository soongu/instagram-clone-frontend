// apps/web-spa/scratch/b5-story-answer.tsx
// B-5 과제 [구현] 예시답안 — 로그인 폼을 React Hook Form 으로.
// 회원가입 폼과 같은 결이되 필드가 둘뿐이라 훨씬 짧다.
import { useForm } from 'react-hook-form';
import { Button } from '../src/components/Button';
import { TextField } from '../src/components/TextField';

export interface LoginValues {
  username: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (values: LoginValues) => void | Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ defaultValues: { username: '', password: '' } });

  return (
    <form className="signup-form" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        id="login-username"
        label="사용자 이름"
        error={errors.username?.message}
        {...register('username', { required: '사용자 이름을 입력해 주세요' })}
      />

      <TextField
        id="login-password"
        label="비밀번호"
        type="password"
        error={errors.password?.message}
        {...register('password', { required: '비밀번호를 입력해 주세요' })}
      />

      <Button className="signup-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? '들어가는 중...' : '로그인'}
      </Button>
    </form>
  );
}
