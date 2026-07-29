// apps/web-spa/scratch/b5-expected-errors.tsx
// B-5 교안이 인용하는 컴파일 에러 모음. 일부러 틀린 코드라 tsc 가 반드시 실패해야 한다.
// 재현: cp 로 src 밖에 두고 tsconfig include 에 잠깐 넣거나, npx tsc --noEmit 로 이 파일만 검사.
import { useForm } from 'react-hook-form';
import { TextField } from '../src/components/TextField';
import type { SignUpValues } from '../src/components/SignUpForm';

export function WrongFieldName() {
  const { register } = useForm<SignUpValues>();
  // ① 필드 이름 오타 — 제네릭 인자가 이름을 붙들고 있어서 여기서 걸린다
  return <input {...register('usernam')} />;
}

export function NoGenericArgument() {
  // ② 제네릭 인자를 안 주면 아무 이름이나 통과한다 (에러 아님 — 대비용)
  const { register } = useForm();
  return <input {...register('아무거나')} />;
}

export function ErrorWithoutOptionalChain() {
  const {
    formState: { errors },
  } = useForm<SignUpValues>();
  // ③ 에러가 없을 수도 있는데 물음표를 안 붙였다
  return <p>{errors.username.message}</p>;
}

export function TextFieldWithoutLabel() {
  // ④ TextField 가 반드시 받아야 하는 label 을 빠뜨렸다
  return <TextField id="x" />;
}

export function TextFieldWrongErrorType() {
  const {
    formState: { errors },
  } = useForm<SignUpValues>();
  // ⑤ error 는 문자열인데 에러 객체를 통째로 넘겼다
  return <TextField id="x" label="사용자 이름" error={errors.username} />;
}

export function HandleSubmitWrongShape() {
  const { handleSubmit } = useForm<SignUpValues>();
  // ⑥ 제출 처리 함수가 받는 것은 값 객체지 이벤트가 아니다
  return <form onSubmit={handleSubmit((event: React.FormEvent) => console.log(event))} />;
}
