import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUpForm } from './SignUpForm';

// 교안 Step 5 "언제 검사할지 정하기" 표와 생각해볼 주제 3 의 근거.
describe('B5 Step 5 — 검사 시점', () => {
  it('기본값은 제출할 때다 — 칸을 벗어나도 조용하다', async () => {
    render(<SignUpForm onSubmit={() => {}} />);

    await userEvent.type(screen.getByLabelText('이메일'), 'nope');
    await userEvent.tab();

    // 벗어났는데도 아직 아무 말이 없다
    expect(screen.queryByText('이메일 모양이 아니에요')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '가입하기' }));
    expect(await screen.findByText('이메일 모양이 아니에요')).toBeInTheDocument();
  });

  it('한 번 걸린 뒤에는 칠 때마다 다시 본다', async () => {
    render(<SignUpForm onSubmit={() => {}} />);

    await userEvent.type(screen.getByLabelText('이메일'), 'nope');
    await userEvent.click(screen.getByRole('button', { name: '가입하기' }));
    expect(await screen.findByText('이메일 모양이 아니에요')).toBeInTheDocument();

    // 벗어나지 않고 그 자리에서 고치기만 해도 사라진다
    await userEvent.type(screen.getByLabelText('이메일'), '@example.com');
    expect(screen.queryByText('이메일 모양이 아니에요')).not.toBeInTheDocument();
  });

  it("mode: 'onBlur' 로 바꾸면 벗어나는 순간 검사한다", async () => {
    function BlurModeForm() {
      const {
        register,
        formState: { errors },
      } = useForm<{ email: string }>({
        defaultValues: { email: '' },
        mode: 'onBlur',
      });

      return (
        <form>
          <input
            aria-label="이메일"
            {...register('email', {
              pattern: { value: /^\S+@\S+\.\S+$/, message: '이메일 모양이 아니에요' },
            })}
          />
          {errors.email && <p role="alert">{errors.email.message}</p>}
          <button type="button">다른 곳</button>
        </form>
      );
    }

    render(<BlurModeForm />);

    await userEvent.type(screen.getByLabelText('이메일'), 'nope');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await userEvent.tab();
    expect(await screen.findByRole('alert')).toHaveTextContent('이메일 모양이 아니에요');
  });
});
