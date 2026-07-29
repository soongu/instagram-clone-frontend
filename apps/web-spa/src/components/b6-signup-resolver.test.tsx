import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUpForm } from './SignUpForm';
import { SignUpSchema } from '../lib/schemas';

const VALID = {
  username: 'jaehoon',
  email: 'jaehoon@spartaclub.kr',
  password: 'sparta1234',
  passwordConfirm: 'sparta1234',
};

async function 폼을채우고제출한다(values: typeof VALID) {
  await userEvent.type(screen.getByLabelText('사용자 이름'), values.username);
  await userEvent.type(screen.getByLabelText('이메일'), values.email);
  await userEvent.type(screen.getByLabelText('비밀번호'), values.password);
  await userEvent.type(screen.getByLabelText('비밀번호 확인'), values.passwordConfirm);
  await userEvent.click(screen.getByRole('button', { name: '가입하기' }));
}

// 교안 Step 4~5 — 규칙은 스키마에만 있고, 폼은 그 스키마를 받아 쓴다.
describe('B6 Step 4 — zodResolver 로 연결하면 화면 메시지가 스키마에서 온다', () => {
  it('화면에 뜬 메시지가 스키마가 만든 메시지와 같다', async () => {
    render(<SignUpForm onSubmit={() => {}} />);

    await userEvent.type(screen.getByLabelText('사용자 이름'), 'Jae');
    await userEvent.type(screen.getByLabelText('이메일'), 'nope');
    await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

    // 같은 값을 스키마에 직접 넣어 얻은 메시지
    const 스키마가만든것 = SignUpSchema.safeParse({ ...VALID, username: 'Jae', email: 'nope' });
    const 사용자이름메시지 = 스키마가만든것.error?.issues.find((i) => i.path[0] === 'username')?.message;
    const 이메일메시지 = 스키마가만든것.error?.issues.find((i) => i.path[0] === 'email')?.message;

    expect(사용자이름메시지).toBeDefined();
    expect(이메일메시지).toBeDefined();
    expect(await screen.findByText(사용자이름메시지!)).toBeInTheDocument();
    expect(screen.getByText(이메일메시지!)).toBeInTheDocument();
  });

  it('통과한 값은 스키마가 내준 data 와 같은 모양으로 제출 함수에 들어간다', async () => {
    const handleSubmit = vi.fn();
    render(<SignUpForm onSubmit={handleSubmit} />);

    await 폼을채우고제출한다(VALID);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(SignUpSchema.parse(VALID));
  });

  it('B-5 에서 손으로 쓴 정규식이 통과시키던 주소를 이제는 막는다', async () => {
    const handleSubmit = vi.fn();
    render(<SignUpForm onSubmit={handleSubmit} />);

    await 폼을채우고제출한다({ ...VALID, email: 'jae..hoon@spartaclub.kr' });

    expect(await screen.findByText('이메일 모양이 아니에요')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});

describe('B6 Step 5 — .refine 이 만든 메시지는 지목한 칸에 붙는다', () => {
  it('비밀번호가 다르면 확인 칸 아래에만 뜬다', async () => {
    render(<SignUpForm onSubmit={() => {}} />);

    await 폼을채우고제출한다({ ...VALID, passwordConfirm: 'sparta9999' });

    const 메시지 = await screen.findByText('비밀번호가 일치하지 않아요');
    // 확인 칸과 같은 묶음 안에 있다
    const 확인칸묶음 = screen.getByLabelText('비밀번호 확인').closest('.signup-field');
    expect(확인칸묶음).toContainElement(메시지);
  });
});
