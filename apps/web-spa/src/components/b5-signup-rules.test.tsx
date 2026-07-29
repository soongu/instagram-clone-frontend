import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUpForm } from './SignUpForm';

// 교안 Step 5 — register 에 규칙을 달고 formState.errors 로 메시지를 띄운다.
describe('B5 Step 5 — 검증 규칙과 formState.errors', () => {
  it('빈 채로 제출하면 필드마다 required 메시지가 뜬다', async () => {
    const handleSubmit = vi.fn();
    render(<SignUpForm onSubmit={handleSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

    expect(await screen.findByText('사용자 이름을 입력해 주세요')).toBeInTheDocument();
    expect(screen.getByText('이메일을 입력해 주세요')).toBeInTheDocument();
    expect(screen.getByText('비밀번호를 입력해 주세요')).toBeInTheDocument();
    expect(screen.getByText('비밀번호를 한 번 더 입력해 주세요')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('규칙을 어기면 규칙별 메시지로 갈린다', async () => {
    render(<SignUpForm onSubmit={() => {}} />);

    await userEvent.type(screen.getByLabelText('사용자 이름'), 'Jae');
    await userEvent.type(screen.getByLabelText('이메일'), 'nope');
    await userEvent.type(screen.getByLabelText('비밀번호'), '123');
    await userEvent.type(screen.getByLabelText('비밀번호 확인'), '123');
    await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

    expect(
      await screen.findByText('영문 소문자·숫자·마침표·밑줄로 4~20자여야 해요'),
    ).toBeInTheDocument();
    expect(screen.getByText('이메일 모양이 아니에요')).toBeInTheDocument();
    expect(screen.getByText('8자 이상이어야 해요')).toBeInTheDocument();
  });

  it('비밀번호 확인은 옆 필드를 봐야 갈린다 — validate 로 교차 검사', async () => {
    render(<SignUpForm onSubmit={() => {}} />);

    await userEvent.type(screen.getByLabelText('사용자 이름'), 'jaehoon');
    await userEvent.type(screen.getByLabelText('이메일'), 'jaehoon@example.com');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'password1');
    await userEvent.type(screen.getByLabelText('비밀번호 확인'), 'password2');
    await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

    expect(await screen.findByText('비밀번호가 일치하지 않아요')).toBeInTheDocument();
  });

  it('한 번 걸린 뒤에는 고치는 즉시 메시지가 사라진다', async () => {
    render(<SignUpForm onSubmit={() => {}} />);

    await userEvent.click(screen.getByRole('button', { name: '가입하기' }));
    expect(await screen.findByText('이메일을 입력해 주세요')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('이메일'), 'jaehoon@example.com');

    await waitFor(() => {
      expect(screen.queryByText('이메일을 입력해 주세요')).not.toBeInTheDocument();
    });
  });

  it('보내는 동안 버튼이 잠기고 글자가 바뀐다 — isSubmitting', async () => {
    let release = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });

    render(<SignUpForm onSubmit={() => pending} />);

    await userEvent.type(screen.getByLabelText('사용자 이름'), 'jaehoon');
    await userEvent.type(screen.getByLabelText('이메일'), 'jaehoon@example.com');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'password1');
    await userEvent.type(screen.getByLabelText('비밀번호 확인'), 'password1');
    await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

    const sending = await screen.findByRole('button', { name: '보내는 중...' });
    expect(sending).toBeDisabled();

    release();
    expect(await screen.findByRole('button', { name: '가입하기' })).toBeEnabled();
  });
});
