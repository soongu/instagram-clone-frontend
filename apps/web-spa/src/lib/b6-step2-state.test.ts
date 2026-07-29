// apps/web-spa/src/lib/b6-step2-state.test.ts
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { SignUpSchema as Step2Schema } from '../../scratch/b6-step2-snapshot';
import { SignUpSchema as FinalSchema } from './schemas';

const FILLED = {
  username: 'jaehoon',
  email: 'jaehoon@spartaclub.kr',
  password: 'sparta1234',
  passwordConfirm: 'sparta1234',
};

// 교안 Step 4 는 ".refine 이 아직 없는 상태" 를 서술한다. 그 상태를 박제해 둔다.
describe('B6 Step 4 시점 — .refine 이 붙기 전', () => {
  it('비밀번호가 달라도 통과한다 — Step 5 의 동기', () => {
    const mismatched = { ...FILLED, passwordConfirm: 'sparta9999' };

    expect(Step2Schema.safeParse(mismatched).success).toBe(true);
    expect(FinalSchema.safeParse(mismatched).success).toBe(false);
  });

  it('빈 폼에서는 네 칸에 각각 메시지가 붙는다', () => {
    const empty = { username: '', email: '', password: '', passwordConfirm: '' };
    const { fieldErrors } = z.flattenError(Step2Schema.safeParse(empty).error!);

    expect(Object.keys(fieldErrors)).toEqual(['username', 'email', 'password', 'passwordConfirm']);
    expect(fieldErrors.username?.[0]).toBe('사용자 이름을 입력해 주세요');
    expect(fieldErrors.email?.[0]).toBe('이메일을 입력해 주세요');
    expect(fieldErrors.password?.[0]).toBe('비밀번호를 입력해 주세요');
    expect(fieldErrors.passwordConfirm?.[0]).toBe('비밀번호를 한 번 더 입력해 주세요');
  });

  it('손 정규식이 통과시키던 주소는 이 시점에도 이미 막힌다', () => {
    expect(Step2Schema.safeParse({ ...FILLED, email: 'jae..hoon@spartaclub.kr' }).success).toBe(false);
  });
});

// 교안 Step 5 🙋 — refine 이 건너뛰어지는 조건은 "타입 실패" 하나뿐이다
describe('B6 Step 5 — .refine 의 실행 조건', () => {
  it('값 규칙(.min)이 실패해도 refine 은 돈다', () => {
    const result = FinalSchema.safeParse({
      ...FILLED,
      password: 'short',
      passwordConfirm: 'nomatch',
    });
    const messages = result.error?.issues.map((i) => `${i.path.join('.')}: ${i.message}`);

    expect(messages).toEqual([
      'password: 8자 이상이어야 해요',
      'passwordConfirm: 비밀번호가 일치하지 않아요',
    ]);
  });

  it('타입이 어긋나면 refine 까지 가지 않는다', () => {
    const result = FinalSchema.safeParse({
      username: 123,
      email: 456,
      password: 789,
      passwordConfirm: '다름',
    });
    const paths = result.error?.issues.map((i) => i.path.join('.'));

    // passwordConfirm 불일치는 보고되지 않는다
    expect(paths).toEqual(['username', 'email', 'password']);
  });

  it('빈 폼에서 불일치 메시지가 안 뜨는 건 건너뛰어서가 아니라 빈 칸끼리 같아서다', () => {
    const empty = { username: '', email: '', password: '', passwordConfirm: '' };
    const messages = FinalSchema.safeParse(empty).error?.issues.map((i) => i.message);

    // passwordConfirm 은 빈 칸 규칙 때문에 걸리지만, 불일치 메시지는 없다
    expect(messages).toContain('비밀번호를 한 번 더 입력해 주세요');
    expect(messages).not.toContain('비밀번호가 일치하지 않아요');
    // 같은 스키마에 서로 다른 값을 주면 곧바로 뜬다 = refine 은 돌고 있었다
    expect(
      FinalSchema.safeParse({ ...empty, password: 'a', passwordConfirm: 'b' }).error?.issues.some(
        (i) => i.message === '비밀번호가 일치하지 않아요',
      ),
    ).toBe(true);
  });
});
