// apps/web-spa/src/lib/b6-signup-schema.test.ts
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { SignUpSchema } from './schemas';

const VALID = {
  username: 'jaehoon',
  email: 'jaehoon@spartaclub.kr',
  password: 'sparta1234',
  passwordConfirm: 'sparta1234',
};

// 첫 번째 메시지만 꺼낸다 — 화면에 뜨는 것이 그것이다
function firstMessage(values: unknown, field: string): string | undefined {
  const result = SignUpSchema.safeParse(values);
  return result.error?.issues.find((issue) => issue.path.join('.') === field)?.message;
}

describe('SignUpSchema — safeParse 는 통과 여부와 값을 함께 돌려준다', () => {
  it('제대로 채운 값은 통과하고 data 로 값이 나온다', () => {
    const result = SignUpSchema.safeParse(VALID);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(VALID);
  });

  it('틀린 값은 통과하지 못하고 error 로 이유가 나온다', () => {
    const result = SignUpSchema.safeParse({ ...VALID, username: 'jh' });

    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.error?.issues.length).toBeGreaterThan(0);
  });

  it('issue 에는 어느 칸이 왜 틀렸는지가 담긴다', () => {
    const result = SignUpSchema.safeParse({ ...VALID, password: 'short' });

    expect(result.error?.issues[0]?.path).toEqual(['password']);
    expect(result.error?.issues[0]?.message).toBe('8자 이상이어야 해요');
  });

  it('parse 는 돌려주는 대신 던진다', () => {
    expect(() => SignUpSchema.parse({ ...VALID, password: 'short' })).toThrow(z.ZodError);
  });
});

describe('SignUpSchema — 필드 규칙', () => {
  it('사용자 이름은 영문 소문자·숫자·마침표·밑줄로 4~20자', () => {
    expect(SignUpSchema.safeParse({ ...VALID, username: 'jae_hoon.01' }).success).toBe(true);
    expect(firstMessage({ ...VALID, username: 'jh' }, 'username')).toBe(
      '영문 소문자·숫자·마침표·밑줄로 4~20자여야 해요',
    );
    expect(firstMessage({ ...VALID, username: 'Jaehoon' }, 'username')).toBe(
      '영문 소문자·숫자·마침표·밑줄로 4~20자여야 해요',
    );
  });

  it('빈 칸에는 규칙 메시지가 아니라 입력을 청하는 메시지가 먼저 뜬다', () => {
    expect(firstMessage({ ...VALID, username: '' }, 'username')).toBe('사용자 이름을 입력해 주세요');
    expect(firstMessage({ ...VALID, email: '' }, 'email')).toBe('이메일을 입력해 주세요');
    expect(firstMessage({ ...VALID, password: '' }, 'password')).toBe('비밀번호를 입력해 주세요');
  });

  it('비밀번호는 8자 이상', () => {
    expect(SignUpSchema.safeParse({ ...VALID, password: 'sparta12', passwordConfirm: 'sparta12' }).success).toBe(true);
    expect(firstMessage({ ...VALID, password: 'sparta1', passwordConfirm: 'sparta1' }, 'password')).toBe(
      '8자 이상이어야 해요',
    );
  });

  it('z.email 은 B-5 에서 손으로 쓴 정규식보다 엄격하다', () => {
    const HAND_WRITTEN = /^\S+@\S+\.\S+$/;
    const handWrittenLetThrough = ['a@b.c', 'jaehoon@@spartaclub.kr', '.jae@x.kr', 'jae..hoon@x.kr'];

    for (const address of handWrittenLetThrough) {
      expect(HAND_WRITTEN.test(address)).toBe(true);
      expect(SignUpSchema.safeParse({ ...VALID, email: address }).success).toBe(false);
    }

    expect(SignUpSchema.safeParse({ ...VALID, email: 'jaehoon@spartaclub.kr' }).success).toBe(true);
  });

  it('메시지를 안 주면 영어가 나온다 — 그래서 error 옵션을 매번 준다', () => {
    const withoutMessage = z.string().min(8);

    expect(withoutMessage.safeParse('short').error?.issues[0]?.message).toBe(
      'Too small: expected string to have >=8 characters',
    );
    expect(z.email().safeParse('nope').error?.issues[0]?.message).toBe('Invalid email address');
  });
});

describe('SignUpSchema — .refine 은 두 칸을 같이 본다', () => {
  it('비밀번호와 확인이 다르면 확인 칸에 메시지가 붙는다', () => {
    const result = SignUpSchema.safeParse({ ...VALID, passwordConfirm: 'sparta9999' });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toHaveLength(1);
    expect(result.error?.issues[0]?.path).toEqual(['passwordConfirm']);
    expect(result.error?.issues[0]?.message).toBe('비밀번호가 일치하지 않아요');
  });

  it('두 칸을 같이 보는 검사라 code 가 custom 이다', () => {
    const result = SignUpSchema.safeParse({ ...VALID, passwordConfirm: 'sparta9999' });

    expect(result.error?.issues[0]?.code).toBe('custom');
  });
});

describe('SignUpSchema — 적어두지 않은 필드는 걸러진다', () => {
  it('여분 키는 거부가 아니라 제거다', () => {
    const result = SignUpSchema.safeParse({ ...VALID, 몰래붙은필드: '값' });

    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty('몰래붙은필드');
  });
});
