// apps/web-spa/scratch/b5-step4-snapshot.tsx
// B-5 Step 4 의 RHF 첫 판. Step 5 에서 검증 규칙이 붙기 전 모습이다.
// 임포트 경로를 빼면 교안 본문과 글자 단위로 같다.
import { useForm } from 'react-hook-form';
import { Button } from '../src/components/Button';
import { ProfileImagePicker } from '../src/components/ProfileImagePicker';

export interface SignUpValues {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

interface SignUpFormProps {
  onSubmit: (values: SignUpValues) => void;
}

const EMPTY_VALUES: SignUpValues = {
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
};

export function SignUpForm({ onSubmit }: SignUpFormProps) {
  const { register, handleSubmit, reset } = useForm<SignUpValues>({
    defaultValues: EMPTY_VALUES,
  });

  // 검사를 다 통과했을 때만 이 함수가 불린다
  function handleValid(values: SignUpValues) {
    onSubmit(values);
    reset();
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit(handleValid)}>
      <ProfileImagePicker />

      <div className="signup-field">
        <label className="signup-label" htmlFor="signup-username">
          사용자 이름
        </label>
        <input className="signup-input" id="signup-username" {...register('username')} />
      </div>

      <div className="signup-field">
        <label className="signup-label" htmlFor="signup-email">
          이메일
        </label>
        <input className="signup-input" id="signup-email" {...register('email')} />
      </div>

      <div className="signup-field">
        <label className="signup-label" htmlFor="signup-password">
          비밀번호
        </label>
        <input
          className="signup-input"
          id="signup-password"
          type="password"
          {...register('password')}
        />
      </div>

      <div className="signup-field">
        <label className="signup-label" htmlFor="signup-passwordConfirm">
          비밀번호 확인
        </label>
        <input
          className="signup-input"
          id="signup-passwordConfirm"
          type="password"
          {...register('passwordConfirm')}
        />
      </div>

      <Button className="signup-submit" type="submit">
        가입하기
      </Button>
    </form>
  );
}
