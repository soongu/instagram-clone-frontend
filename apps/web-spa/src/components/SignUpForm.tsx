// apps/web-spa/src/components/SignUpForm.tsx
import { useForm } from 'react-hook-form';
import { Button } from './Button';
import { ProfileImagePicker } from './ProfileImagePicker';
import { TextField } from './TextField';

export interface SignUpValues {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

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

// 백엔드가 받는 규칙과 같은 모양으로 맞췄다
const USERNAME_PATTERN = /^[a-z0-9._]{4,20}$/;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export function SignUpForm({ onSubmit }: SignUpFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({ defaultValues: EMPTY_VALUES });

  // 검사를 다 통과했을 때만 이 함수가 불린다
  async function handleValid(values: SignUpValues) {
    await onSubmit(values);
    reset();
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit(handleValid)}>
      <ProfileImagePicker />

      <TextField
        id="signup-username"
        label="사용자 이름"
        error={errors.username?.message}
        {...register('username', {
          required: '사용자 이름을 입력해 주세요',
          pattern: {
            value: USERNAME_PATTERN,
            message: '영문 소문자·숫자·마침표·밑줄로 4~20자여야 해요',
          },
        })}
      />

      <TextField
        id="signup-email"
        label="이메일"
        error={errors.email?.message}
        {...register('email', {
          required: '이메일을 입력해 주세요',
          pattern: { value: EMAIL_PATTERN, message: '이메일 모양이 아니에요' },
        })}
      />

      <TextField
        id="signup-password"
        label="비밀번호"
        type="password"
        error={errors.password?.message}
        {...register('password', {
          required: '비밀번호를 입력해 주세요',
          minLength: { value: 8, message: '8자 이상이어야 해요' },
        })}
      />

      <TextField
        id="signup-passwordConfirm"
        label="비밀번호 확인"
        type="password"
        error={errors.passwordConfirm?.message}
        {...register('passwordConfirm', {
          required: '비밀번호를 한 번 더 입력해 주세요',
          // 이 필드 하나만 봐서는 알 수 없다 — 옆 필드를 같이 봐야 한다
          validate: (value, values) =>
            value === values.password || '비밀번호가 일치하지 않아요',
        })}
      />

      <Button className="signup-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? '보내는 중...' : '가입하기'}
      </Button>
    </form>
  );
}
