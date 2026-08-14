// apps/web-spa/scratch/c6-mutation-signature-probe.test.tsx
//
// C-6 착수 전 시그니처 실측 (내부 검증용)
//
// 설치본 5.101.4 의 타입 선언은 뮤테이션 콜백을 이렇게 적고 있다.
//   onMutate?:  (variables, context) => TOnMutateResult
//   onError?:   (error, variables, onMutateResult, context) => ...
//   onSettled?: (data, error, variables, onMutateResult, context) => ...
//
// 시중 자료는 전부 3인자(err, variables, context) 형태다. 위치가 같으니
// 안 터질 것 같은데, C-5 에서 예측이 두 번 틀렸으므로 재본다.
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import type { ReactNode } from 'react';

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function freshClient() {
  return new QueryClient({ defaultOptions: { mutations: { retry: false } } });
}

describe('mutationFn 은 몇 개를 받나', () => {
  it('두 번째 인자로 client·meta·mutationKey 가 온다', async () => {
    const client = freshClient();
    const seen: unknown[] = [];

    const { result } = renderHook(
      () =>
        useMutation({
          mutationKey: ['probe', 'fn'],
          mutationFn: async (...args: unknown[]) => {
            seen.push(...args);
            return 'done';
          },
        }),
      { wrapper: wrapper(client) },
    );

    act(() => result.current.mutate(7 as never));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(seen[0]).toBe(7);
    expect(seen).toHaveLength(2);
    expect(Object.keys(seen[1] as object).sort()).toEqual(['client', 'meta', 'mutationKey']);
    expect((seen[1] as { client: unknown }).client).toBe(client);
    expect((seen[1] as { mutationKey: unknown }).mutationKey).toEqual(['probe', 'fn']);
  });
});

describe('onMutate 도 두 번째 인자를 받나', () => {
  it('context.client 로 캐시에 손댈 수 있다 — useQueryClient() 없이', async () => {
    const client = freshClient();
    client.setQueryData(['probe', 'value'], '처음');

    const { result } = renderHook(
      () =>
        useMutation({
          mutationFn: async () => 'ok',
          onMutate: (_variables, context) => {
            context.client.setQueryData(['probe', 'value'], '바꾼 값');
            return { before: '처음' };
          },
        }),
      { wrapper: wrapper(client) },
    );

    act(() => result.current.mutate(undefined as never));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(client.getQueryData(['probe', 'value'])).toBe('바꾼 값');
  });
});

describe('실패 콜백의 인자 순서', () => {
  it('세 번째가 onMutate 가 돌려준 것, 네 번째가 context 다', async () => {
    const client = freshClient();
    const args: unknown[] = [];

    const { result } = renderHook(
      () =>
        useMutation({
          mutationFn: async () => {
            throw new Error('거절');
          },
          onMutate: () => ({ before: '처음' }),
          onError: (...received: unknown[]) => {
            args.push(...received);
          },
        }),
      { wrapper: wrapper(client) },
    );

    act(() => result.current.mutate('바꿀 값' as never));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(args).toHaveLength(4);
    expect((args[0] as Error).message).toBe('거절');
    expect(args[1]).toBe('바꿀 값');
    expect(args[2]).toEqual({ before: '처음' });
    expect((args[3] as { client: unknown }).client).toBe(client);
  });

  it('onSettled 는 다섯 개를 받는다', async () => {
    const client = freshClient();
    const args: unknown[] = [];

    const { result } = renderHook(
      () =>
        useMutation({
          mutationFn: async () => 'ok',
          onMutate: () => ({ before: '처음' }),
          onSettled: (...received: unknown[]) => {
            args.push(...received);
          },
        }),
      { wrapper: wrapper(client) },
    );

    act(() => result.current.mutate('값' as never));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(args).toHaveLength(5);
    expect(args[0]).toBe('ok');
    expect(args[1]).toBeNull();
    expect(args[2]).toBe('값');
    expect(args[3]).toEqual({ before: '처음' });
    expect((args[4] as { client: unknown }).client).toBe(client);
  });
});

describe('옛 3인자 형태는 아직 도나', () => {
  it('세 번째를 context 라고 이름 붙여도 롤백이 그대로 동작한다', async () => {
    const client = freshClient();
    client.setQueryData(['probe', 'old'], '처음');

    const { result } = renderHook(
      () =>
        useMutation({
          mutationFn: async () => {
            throw new Error('거절');
          },
          onMutate: () => {
            const previous = client.getQueryData(['probe', 'old']);
            client.setQueryData(['probe', 'old'], '먼저 바꾼 값');
            return { previous };
          },
          // 시중 자료가 쓰는 이름 그대로. 위치가 같아서 값도 같다.
          onError: (_error, _variables, context) => {
            client.setQueryData(['probe', 'old'], context?.previous);
          },
        }),
      { wrapper: wrapper(client) },
    );

    act(() => result.current.mutate(undefined as never));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(client.getQueryData(['probe', 'old'])).toBe('처음');
  });
});
