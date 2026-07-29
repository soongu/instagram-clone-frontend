import { Profiler, StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUpFormManual as SignUpForm } from '../../scratch/b5-lecture-snapshots';

// 교안 Step 3 — 손으로 만든 회원가입 폼이 실제로 어떻게 동작하는지.
describe('B5 Step 3 — 손으로 만든 회원가입 폼', () => {
  it('규칙을 다 지키면 제출되고 폼이 비워진다', async () => {
    const handleSubmit = vi.fn();
    render(<SignUpForm onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText('사용자 이름'), 'jaehoon');
    await userEvent.type(screen.getByLabelText('이메일'), 'jaehoon@example.com');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'password1');
    await userEvent.type(screen.getByLabelText('비밀번호 확인'), 'password1');
    await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      username: 'jaehoon',
      email: 'jaehoon@example.com',
      password: 'password1',
      passwordConfirm: 'password1',
    });
    expect(screen.getByLabelText<HTMLInputElement>('사용자 이름').value).toBe('');
  });

  it('규칙을 어기면 제출이 막히고 필드마다 메시지가 뜬다', async () => {
    const handleSubmit = vi.fn();
    render(<SignUpForm onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText('사용자 이름'), 'Jae');
    await userEvent.type(screen.getByLabelText('이메일'), 'nope');
    await userEvent.type(screen.getByLabelText('비밀번호'), '123');
    await userEvent.type(screen.getByLabelText('비밀번호 확인'), '456');
    await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('영문 소문자·숫자·마침표·밑줄로 4~20자여야 해요')).toBeInTheDocument();
    expect(screen.getByText('이메일 모양이 아니에요')).toBeInTheDocument();
    expect(screen.getByText('8자 이상이어야 해요')).toBeInTheDocument();
    expect(screen.getByText('비밀번호가 일치하지 않아요')).toBeInTheDocument();
  });

  it('건드리기 전에는 메시지가 안 뜬다 — touched 를 따로 들고 있는 이유', async () => {
    render(<SignUpForm onSubmit={() => {}} />);

    // 값이 비어서 규칙에는 이미 어긋나 있지만 아직 아무 메시지도 없다
    expect(screen.queryByText('이메일 모양이 아니에요')).not.toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('이메일'));
    await userEvent.tab();

    expect(screen.getByText('이메일 모양이 아니에요')).toBeInTheDocument();
  });

  it('고치면 메시지가 사라진다', async () => {
    render(<SignUpForm onSubmit={() => {}} />);

    await userEvent.type(screen.getByLabelText('이메일'), 'nope');
    await userEvent.tab();
    expect(screen.getByText('이메일 모양이 아니에요')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('이메일'), '@example.com');
    expect(screen.queryByText('이메일 모양이 아니에요')).not.toBeInTheDocument();
  });

  // 교안이 "한 글자마다 폼 전체가 다시 그려진다" 고 쓰려면 이 숫자가 근거다.
  // 커밋 횟수는 Profiler 로 센다 — 프로덕션 코드에 계측을 넣지 않으려고.
  it('마운트 커밋 1회, 네 글자를 치면 4회가 더해진다 (StrictMode)', async () => {
    let commits = 0;

    render(
      <StrictMode>
        <Profiler id="signup" onRender={() => (commits += 1)}>
          <SignUpForm onSubmit={() => {}} />
        </Profiler>
      </StrictMode>,
    );

    const mounted = commits;
    await userEvent.type(screen.getByLabelText('사용자 이름'), 'jaeh');
    const typed = commits;

    expect(mounted).toBe(1);
    expect(typed).toBe(5);
  });
});
