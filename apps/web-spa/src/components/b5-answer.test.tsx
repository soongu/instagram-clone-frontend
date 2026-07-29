import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../../scratch/b5-story-answer';

// 과제 [구현] 답안 채증
describe('B5 과제 1 — 로그인 폼', () => {
  it('둘 다 채우면 값이 그대로 넘어간다', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText('사용자 이름'), 'jaehoon');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'password1');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    expect(handleSubmit).toHaveBeenCalledWith(
      { username: 'jaehoon', password: 'password1' },
      expect.anything(),
    );
  });

  it('비어 있으면 필드마다 메시지가 뜨고 제출이 막힌다', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByText('사용자 이름을 입력해 주세요')).toBeInTheDocument();
    expect(screen.getByText('비밀번호를 입력해 주세요')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});

// 과제 [탐구] 답안 채증
describe('B5 과제 2 — 직접 확인해보기', () => {
  it('value 와 defaultValue 를 같이 주면 React 가 경고한다', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function BothProps() {
      return <input aria-label="둘 다 준 입력창" value="a" defaultValue="b" onChange={() => {}} />;
    }
    render(<BothProps />);

    // React 경고는 %s 자리표시자를 쓰므로 인자까지 합쳐서 본다
    const messages = errorSpy.mock.calls.map((call) => call.map(String).join(' ')).join('\n');
    expect(messages).toContain('contains an input of type');
    expect(messages).toContain('with both value and defaultValue props');
    errorSpy.mockRestore();
  });

  it('register 를 하나씩 붙여도 똑같이 동작한다', async () => {
    const handleSubmit = vi.fn();

    function SpreadByHand() {
      const { register, handleSubmit: rhfSubmit } = useForm<{ nickname: string }>({
        defaultValues: { nickname: '' },
      });
      const field = register('nickname');

      return (
        <form onSubmit={rhfSubmit(handleSubmit)}>
          <input
            aria-label="손으로 붙인 입력창"
            name={field.name}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
          />
          <button type="submit">보내기</button>
        </form>
      );
    }

    render(<SpreadByHand />);
    await userEvent.type(screen.getByLabelText('손으로 붙인 입력창'), 'jaehoon');
    await userEvent.click(screen.getByRole('button', { name: '보내기' }));

    expect(handleSubmit).toHaveBeenCalledWith({ nickname: 'jaehoon' }, expect.anything());
  });

  it('ref 만 빼면 값을 못 읽는다 — RHF 가 값을 꺼내는 통로가 ref 다', async () => {
    const handleSubmit = vi.fn();

    function MissingRef() {
      const { register, handleSubmit: rhfSubmit } = useForm<{ nickname: string }>({
        defaultValues: { nickname: '' },
      });
      const field = register('nickname');

      return (
        <form onSubmit={rhfSubmit(handleSubmit)}>
          <input
            aria-label="ref 를 뺀 입력창"
            name={field.name}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
          <button type="submit">보내기</button>
        </form>
      );
    }

    render(<MissingRef />);
    await userEvent.type(screen.getByLabelText('ref 를 뺀 입력창'), 'jaehoon');
    await userEvent.click(screen.getByRole('button', { name: '보내기' }));

    // 글자를 쳤는데도 값이 하나도 안 담겨 온다
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit.mock.calls[0][0]).toEqual({});
  });
});
