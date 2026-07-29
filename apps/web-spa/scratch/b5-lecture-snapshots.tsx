// apps/web-spa/scratch/b5-lecture-snapshots.tsx
// B-5 Step 3 의 손으로 만든 회원가입 폼. Step 4 에서 RHF 판으로 갈아엎기 전 모습이다.
// 이름(SignUpFormManual)과 임포트 경로를 빼면 교안 본문과 글자 단위로 같다.
import { useState } from 'react';
import { Button } from '../src/components/Button';
import { ProfileImagePicker } from '../src/components/ProfileImagePicker';

interface SignUpValues {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

// 필드마다 메시지가 하나씩 붙을 수 있다. 아직 안 걸린 필드는 비어 있다.
type SignUpErrors = Partial<Record<'username' | 'email' | 'password' | 'passwordConfirm', string>>;
type SignUpTouched = Partial<Record<'username' | 'email' | 'password' | 'passwordConfirm', boolean>>;

interface SignUpFormProps {
  onSubmit: (values: SignUpValues) => void;
}

const EMPTY_VALUES: SignUpValues = {
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
};

// 백엔드가 받는 규칙과 같은 모양으로 맞췄다
const USERNAME_PATTERN = /^[a-z0-9._]{4,20}$/;

// 규칙이 넷이면 검사도 넷이다. 필드가 늘면 이 함수도 같이 길어진다.
function validate(values: SignUpValues): SignUpErrors {
  const errors: SignUpErrors = {};

  if (!USERNAME_PATTERN.test(values.username)) {
    errors.username = '영문 소문자·숫자·마침표·밑줄로 4~20자여야 해요';
  }
  if (!values.email.includes('@')) {
    errors.email = '이메일 모양이 아니에요';
  }
  if (values.password.length < 8) {
    errors.password = '8자 이상이어야 해요';
  }
  if (values.password !== values.passwordConfirm) {
    errors.passwordConfirm = '비밀번호가 일치하지 않아요';
  }

  return errors;
}

export function SignUpFormManual({ onSubmit }: SignUpFormProps) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [touched, setTouched] = useState<SignUpTouched>({});

  // 값에서 바로 나오는 것이라 상태로 따로 두지 않는다
  const errors = validate(values);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    setTouched({ ...touched, [event.target.name]: true });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTouched({ username: true, email: true, password: true, passwordConfirm: true });

    if (Object.keys(errors).length > 0) {
      return;
    }

    onSubmit(values);
    setValues(EMPTY_VALUES);
    setTouched({});
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <ProfileImagePicker />

      <div className="signup-field">
        <label className="signup-label" htmlFor="signup-username">
          사용자 이름
        </label>
        <input
          className="signup-input"
          id="signup-username"
          name="username"
          value={values.username}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.username && errors.username && <p className="signup-error">{errors.username}</p>}
      </div>

      <div className="signup-field">
        <label className="signup-label" htmlFor="signup-email">
          이메일
        </label>
        <input
          className="signup-input"
          id="signup-email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.email && errors.email && <p className="signup-error">{errors.email}</p>}
      </div>

      <div className="signup-field">
        <label className="signup-label" htmlFor="signup-password">
          비밀번호
        </label>
        <input
          className="signup-input"
          id="signup-password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.password && errors.password && <p className="signup-error">{errors.password}</p>}
      </div>

      <div className="signup-field">
        <label className="signup-label" htmlFor="signup-passwordConfirm">
          비밀번호 확인
        </label>
        <input
          className="signup-input"
          id="signup-passwordConfirm"
          name="passwordConfirm"
          type="password"
          value={values.passwordConfirm}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.passwordConfirm && errors.passwordConfirm && (
          <p className="signup-error">{errors.passwordConfirm}</p>
        )}
      </div>

      <Button className="signup-submit" type="submit">
        가입하기
      </Button>
    </form>
  );
}

// ── B-5 Step 4 의 RHF 첫 판. Step 5 에서 검증 규칙이 붙기 전 모습이다.
// 이름(SignUpFormStep4)과 임포트 경로를 빼면 교안 본문과 글자 단위로 같다.
import { useForm } from 'react-hook-form';
import { Button as Step4Button } from '../src/components/Button';
import { ProfileImagePicker as Step4Picker } from '../src/components/ProfileImagePicker';

interface Step4Values {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

interface Step4Props {
  onSubmit: (values: Step4Values) => void;
}

const STEP4_EMPTY: Step4Values = {
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
};

export function SignUpFormStep4({ onSubmit }: Step4Props) {
  const { register, handleSubmit, reset } = useForm<Step4Values>({
    defaultValues: STEP4_EMPTY,
  });

  // 검사를 다 통과했을 때만 이 함수가 불린다
  function handleValid(values: Step4Values) {
    onSubmit(values);
    reset();
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit(handleValid)}>
      <Step4Picker />

      <div className="signup-field">
        <label className="signup-label" htmlFor="step4-username">
          사용자 이름
        </label>
        <input className="signup-input" id="step4-username" {...register('username')} />
      </div>

      <div className="signup-field">
        <label className="signup-label" htmlFor="step4-email">
          이메일
        </label>
        <input className="signup-input" id="step4-email" {...register('email')} />
      </div>

      <div className="signup-field">
        <label className="signup-label" htmlFor="step4-password">
          비밀번호
        </label>
        <input
          className="signup-input"
          id="step4-password"
          type="password"
          {...register('password')}
        />
      </div>

      <div className="signup-field">
        <label className="signup-label" htmlFor="step4-passwordConfirm">
          비밀번호 확인
        </label>
        <input
          className="signup-input"
          id="step4-passwordConfirm"
          type="password"
          {...register('passwordConfirm')}
        />
      </div>

      <Step4Button className="signup-submit" type="submit">
        가입하기
      </Step4Button>
    </form>
  );
}
