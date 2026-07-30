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

async function fillAndSubmit(values: typeof VALID) {
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
    const fromSchema = SignUpSchema.safeParse({ ...VALID, username: 'Jae', email: 'nope' });
    const usernameMessage = fromSchema.error?.issues.find((i) => i.path[0] === 'username')?.message;
    const emailMessage = fromSchema.error?.issues.find((i) => i.path[0] === 'email')?.message;

    expect(usernameMessage).toBeDefined();
    expect(emailMessage).toBeDefined();
    expect(await screen.findByText(usernameMessage!)).toBeInTheDocument();
    expect(screen.getByText(emailMessage!)).toBeInTheDocument();
  });

  it('통과한 값은 스키마가 내준 data 와 같은 모양으로 제출 함수에 들어간다', async () => {
    const handleSubmit = vi.fn();
    render(<SignUpForm onSubmit={handleSubmit} />);

    await fillAndSubmit(VALID);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(SignUpSchema.parse(VALID));
  });

  it('B-5 에서 손으로 쓴 정규식이 통과시키던 주소를 이제는 막는다', async () => {
    const handleSubmit = vi.fn();
    render(<SignUpForm onSubmit={handleSubmit} />);

    await fillAndSubmit({ ...VALID, email: 'jae..hoon@spartaclub.kr' });

    expect(await screen.findByText('이메일 모양이 아니에요')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});

describe('B6 Step 5 — .refine 이 만든 메시지는 지목한 칸에 붙는다', () => {
  it('비밀번호가 다르면 확인 칸 아래에만 뜬다', async () => {
    render(<SignUpForm onSubmit={() => {}} />);

    await fillAndSubmit({ ...VALID, passwordConfirm: 'sparta9999' });

    const message = await screen.findByText('비밀번호가 일치하지 않아요');
    // 확인 칸과 같은 묶음 안에 있다 (E-2 에서 손 클래스가 사라져 구조로 찾는다 —
    // TextField 는 라벨·입력·오류를 한 div 로 묶는다)
    const confirmField = screen.getByLabelText('비밀번호 확인').closest('div');
    expect(confirmField).toContainElement(message);
  });
});
