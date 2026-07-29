import { Profiler, StrictMode } from 'react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUpForm } from './SignUpForm';
import type { SignUpValues } from '../lib/schemas';
import { SignUpForm as SignUpFormStep4 } from '../../scratch/b5-step4-snapshot';

// 교안 Step 4 — RHF 로 갈아엎은 회원가입 폼.
describe('B5 Step 4 — register 가 펼치는 것', () => {
  it('register 는 name·onChange·onBlur·ref 네 가지를 돌려준다', () => {
    const { result } = renderHook(() => useForm<SignUpValues>());
    const spread = result.current.register('username');

    expect(Object.keys(spread).sort()).toEqual(['name', 'onBlur', 'onChange', 'ref']);
    expect(spread.name).toBe('username');
    expect(typeof spread.ref).toBe('function');
  });

  it('입력값을 모아 한 번에 넘긴다', async () => {
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
  });

  it('제출한 뒤 reset 으로 입력창이 비워진다', async () => {
    render(<SignUpForm onSubmit={() => {}} />);

    await userEvent.type(screen.getByLabelText('사용자 이름'), 'jaehoon');
    await userEvent.type(screen.getByLabelText('이메일'), 'jaehoon@example.com');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'password1');
    await userEvent.type(screen.getByLabelText('비밀번호 확인'), 'password1');
    await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

    expect(screen.getByLabelText<HTMLInputElement>('사용자 이름').value).toBe('');
  });

  it('네 글자를 쳐도 커밋이 늘지 않는다 — 손으로 만든 판은 4회 늘었다 (StrictMode)', async () => {
    let commits = 0;

    render(
      <StrictMode>
        <Profiler id="signup-rhf" onRender={() => (commits += 1)}>
          <SignUpForm onSubmit={() => {}} />
        </Profiler>
      </StrictMode>,
    );

    const mounted = commits;
    await userEvent.type(screen.getByLabelText('사용자 이름'), 'jaeh');
    const typed = commits;

    // 처음 붙을 때는 손으로 만든 판(1)보다 한 번 더 그린다. 대신 타이핑에는 꿈쩍도 않는다.
    expect(mounted).toBe(2);
    expect(typed).toBe(2);
  });

  // Step 4 교안 본문이 인용하는 그 코드가 실제로 도는지
  it('규칙을 달기 전 판도 값을 모아 넘긴다', async () => {
    const handleSubmit = vi.fn();
    render(<SignUpFormStep4 onSubmit={handleSubmit} />);

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
  });
});
