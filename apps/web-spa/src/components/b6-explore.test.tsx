import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 과제 [탐구] 채증 — 스키마를 건드렸을 때 실제로 무슨 일이 일어나는가
const FILLED = {
  username: 'jaehoon',
  email: 'jaehoon@spartaclub.kr',
  password: 'sparta1234',
  passwordConfirm: 'sparta9999',
};

describe('탐구 — .min(1) 을 지우면 빈 칸 메시지가 바뀐다', () => {
  it('min(1) 이 없으면 빈 칸에도 길이 메시지가 뜬다', () => {
    const withGuard = z.string().min(1, { error: '비밀번호를 입력해 주세요' }).min(8, { error: '8자 이상이어야 해요' });
    const without = z.string().min(8, { error: '8자 이상이어야 해요' });

    expect(withGuard.safeParse('').error?.issues[0]?.message).toBe('비밀번호를 입력해 주세요');
    expect(without.safeParse('').error?.issues[0]?.message).toBe('8자 이상이어야 해요');
  });
});

describe('탐구 — error 옵션을 지우면 영어가 나온다', () => {
  it('min 과 email 의 기본 문구', () => {
    expect(z.string().min(8).safeParse('short').error?.issues[0]?.message).toBe(
      'Too small: expected string to have >=8 characters',
    );
    expect(z.email().safeParse('nope').error?.issues[0]?.message).toBe('Invalid email address');
  });
});

describe('탐구 — .refine 의 path 를 지우면 메시지가 어디로 가나', () => {
  const WithPath = z
    .object({
      password: z.string(),
      passwordConfirm: z.string(),
    })
    .refine((v) => v.password === v.passwordConfirm, {
      error: '비밀번호가 일치하지 않아요',
      path: ['passwordConfirm'],
    });

  const WithoutPath = z
    .object({
      password: z.string(),
      passwordConfirm: z.string(),
    })
    .refine((v) => v.password === v.passwordConfirm, {
      error: '비밀번호가 일치하지 않아요',
    });

  it('path 가 있으면 그 칸에, 없으면 빈 경로에 담긴다', () => {
    expect(WithPath.safeParse(FILLED).error?.issues[0]?.path).toEqual(['passwordConfirm']);
    expect(WithoutPath.safeParse(FILLED).error?.issues[0]?.path).toEqual([]);
  });

  it('flattenError 로 보면 fieldErrors 가 아니라 formErrors 로 간다', () => {
    const withPath = z.flattenError(WithPath.safeParse(FILLED).error!);
    const withoutPath = z.flattenError(WithoutPath.safeParse(FILLED).error!);

    expect(withPath.fieldErrors.passwordConfirm).toEqual(['비밀번호가 일치하지 않아요']);
    expect(withPath.formErrors).toEqual([]);

    expect(withoutPath.fieldErrors).toEqual({});
    expect(withoutPath.formErrors).toEqual(['비밀번호가 일치하지 않아요']);
  });

  it('폼에서는 제출이 막히는데 errors 는 통째로 비어 있다 — 버튼이 먹통처럼 보인다', async () => {
    const onValid = vi.fn();
    const { result } = renderHook(() =>
      useForm({ resolver: zodResolver(WithoutPath), defaultValues: { password: '', passwordConfirm: '' } }),
    );

    await act(async () => {
      result.current.setValue('password', 'sparta1234');
      result.current.setValue('passwordConfirm', 'sparta9999');
      await result.current.handleSubmit(onValid)();
    });

    // 검사에는 걸린다
    expect(onValid).not.toHaveBeenCalled();
    expect(result.current.formState.isValid).toBe(false);
    // 그런데 화면에 그릴 메시지가 아무 데도 없다
    expect(Object.keys(result.current.formState.errors)).toEqual([]);
  });
});

describe('탐구 — mediaKind 를 z.string() 으로 바꾸면 걸리는 수가 준다', () => {
  const fields = {
    id: z.number(),
    username: z.string(),
    profileImageUrl: z.string(),
    imageUrl: z.string(),
    content: z.string(),
    hashtagNames: z.array(z.string()),
    likeCount: z.number(),
    commentCount: z.number(),
    liked: z.boolean(),
    createdAt: z.string(),
  };
  const broken = {
    id: 1,
    username: 'jaehoon',
    imageUrl: 'x',
    likeCount: 1240,
    profileImageUrl: null,
    mediaKind: 'gif',
    content: 42,
    hashtagNames: '한강',
    commentCount: '32',
    liked: 'false',
    createdAt: 0,
  };

  it('enum 이면 일곱, string 이면 여섯', () => {
    const strict = z.object({ ...fields, mediaKind: z.enum(['image', 'video', 'carousel']) });
    const loose = z.object({ ...fields, mediaKind: z.string() });

    expect(strict.safeParse(broken).error?.issues).toHaveLength(7);
    expect(loose.safeParse(broken).error?.issues).toHaveLength(6);
  });
});
