// apps/web-spa/scratch/b6-expected-errors.tsx
// B-6 교안이 인용하는 컴파일 에러 모음. 일부러 틀린 코드라 tsc 가 반드시 실패해야 한다.
// 재현: npx tsc --noEmit --jsx react-jsx --strict --skipLibCheck scratch/b6-expected-errors.tsx
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignUpSchema, PostSchema, type SignUpValues } from '../src/lib/schemas';
import type { Post } from '../src/types/instagram';

export function WrongFieldName() {
  const { register } = useForm<SignUpValues>({ resolver: zodResolver(SignUpSchema) });
  // ① 이름 오타 — 이제 이 목록은 스키마에서 나온다
  return <input {...register('usernam')} />;
}

export function FieldNotInSchema() {
  const { register } = useForm<SignUpValues>({ resolver: zodResolver(SignUpSchema) });
  // ② 스키마에 없는 칸 — 스키마에 추가하지 않는 한 폼에도 못 만든다
  return <input {...register('nickname')} />;
}

// ③ 스키마에서 나온 타입에 없는 필드를 읽으려 했다
export function ReadUnknownField(values: SignUpValues): string {
  return values.nickname;
}

// ④ 스키마가 내주는 값의 모양이 안 맞는다 — parse 결과는 Post 지 string 이 아니다
export function WrongParseTarget(payload: unknown): string {
  const post: string = PostSchema.parse(payload);
  return post;
}

// ⑤ 에러 아님 (대비용 · 오늘의 핵심) — parse 가 돌려주는 타입은 Post 와 같으니
// 컴파일은 통과한다. { id: 1 } 이 게시물이 아니라는 사실은 실행해 봐야만 안다.
export function BuildPostWithoutField(): Post {
  return PostSchema.parse({ id: 1 });
}

// ⑥ safeParse 는 실패했을 수도 있다 — 확인 없이 data 를 쓰면 걸린다
export function UseDataWithoutChecking(payload: unknown): string {
  const result = PostSchema.safeParse(payload);
  return result.data.username;
}

// ⑦ 에러 아님 (대비용) — v3 식 z.string().email() 은 v4 에서도 컴파일된다.
// 타입 검사로는 못 막고 grep 규약으로만 막는다.
export const OldStyleEmail = z.string().email();
