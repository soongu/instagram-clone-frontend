// apps/web-spa/src/components/SignUpForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignUpSchema, type SignUpValues } from '../lib/schemas';
import { Button } from './Button';
import { ProfileImagePicker } from './ProfileImagePicker';
import { TextField } from './TextField';

interface SignUpFormProps {
  // 서버로 보내는 일은 시간이 걸린다 — 기다릴 수 있게 Promise 도 받는다
  onSubmit: (values: SignUpValues) => void | Promise<void>;
}

const EMPTY_VALUES: SignUpValues = {
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
};

export function SignUpForm({ onSubmit }: SignUpFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    // 검사는 전부 스키마가 한다 — 이 화면에는 규칙이 없다
    resolver: zodResolver(SignUpSchema),
    defaultValues: EMPTY_VALUES,
  });

  // 검사를 다 통과했을 때만 이 함수가 불린다
  async function handleValid(values: SignUpValues) {
    await onSubmit(values);
    reset();
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 lg:max-w-[470px]"
      onSubmit={handleSubmit(handleValid)}
    >
      <ProfileImagePicker />

      <TextField
        id="signup-username"
        label="사용자 이름"
        error={errors.username?.message}
        {...register('username')}
      />

      <TextField
        id="signup-email"
        label="이메일"
        error={errors.email?.message}
        {...register('email')}
      />

      <TextField
        id="signup-password"
        label="비밀번호"
        type="password"
        error={errors.password?.message}
        {...register('password')}
      />

      <TextField
        id="signup-passwordConfirm"
        label="비밀번호 확인"
        type="password"
        error={errors.passwordConfirm?.message}
        {...register('passwordConfirm')}
      />

      <Button
        className="cursor-pointer rounded-lg bg-brand p-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? '보내는 중...' : '가입하기'}
      </Button>
    </form>
  );
}
