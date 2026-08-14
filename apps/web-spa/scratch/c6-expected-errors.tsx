// apps/web-spa/scratch/c6-expected-errors.tsx
//
// C-6 — 타입 검사가 잡아주는 자리와 안 잡아주는 자리 (내부 검증용)
//
// 실행 방법: npx tsc --noEmit --jsx react-jsx --strict --module esnext \
//              --moduleResolution bundler --target es2025 scratch/c6-expected-errors.tsx
import { useMutation } from '@tanstack/react-query';

interface Snapshot {
  previous: string | undefined;
}

// ① 시중 자료 그대로 — 세 번째를 context 라고 부른다.
//    값은 맞다(위치가 같다). 그래서 아무 오류도 안 난다.
export function OldShape() {
  return useMutation({
    mutationFn: async () => 'ok',
    onMutate: (): Snapshot => ({ previous: '처음' }),
    onError: (_error, _variables, context) => {
      console.log(context?.previous);
    },
  });
}

// ② 옛 이름 + 새 문서의 사용법을 섞으면 — 여기서 갈린다.
//    세 번째는 Snapshot 이라 client 가 없다.
export function MixedShape() {
  return useMutation({
    mutationFn: async () => 'ok',
    onMutate: (): Snapshot => ({ previous: '처음' }),
    onError: (_error, _variables, context) => {
      context.client.setQueryData(['x'], 1);
    },
  });
}

// ③ 새 문서 형태 — 네 번째가 진짜 context 다.
export function NewShape() {
  return useMutation({
    mutationFn: async () => 'ok',
    onMutate: (_variables, context): Snapshot => {
      const previous = context.client.getQueryData<string>(['x']);
      return { previous };
    },
    onError: (_error, _variables, onMutateResult, context) => {
      context.client.setQueryData(['x'], onMutateResult?.previous);
    },
  });
}
