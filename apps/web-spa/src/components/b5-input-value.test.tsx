import { StrictMode } from 'react';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ControlledInput, UncontrolledInput } from './InputValueDemo';

// 교안 Step 1 이 인용하는 숫자는 전부 여기서 잰다.
// 실제 앱(main.tsx)이 StrictMode 라 학생 화면과 같은 조건으로 맞춘다.
describe('B5 Step 1 — 값을 누가 들고 있나', () => {
  let logSpy: MockInstance<typeof console.log>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  function countOf(marker: string) {
    return logSpy.mock.calls.filter((call) => call[0] === marker).length;
  }

  const CONTROLLED = '상태가 값을 든 쪽이 다시 그려짐';
  const UNCONTROLLED = 'DOM 이 값을 든 쪽이 다시 그려짐';

  it('controlled 는 한 글자마다 다시 그린다 (StrictMode)', async () => {
    render(
      <StrictMode>
        <ControlledInput />
      </StrictMode>,
    );

    const mounted = countOf(CONTROLLED);
    await userEvent.type(screen.getByLabelText('controlled 닉네임'), 'abc');
    const typed = countOf(CONTROLLED);

    expect(mounted).toBe(2);
    expect(typed).toBe(8);
    expect(screen.getByText('지금 값: abc')).toBeInTheDocument();
  });

  it('uncontrolled 는 타이핑에 한 번도 다시 그리지 않는다 (StrictMode)', async () => {
    render(
      <StrictMode>
        <UncontrolledInput />
      </StrictMode>,
    );

    const mounted = countOf(UNCONTROLLED);
    await userEvent.type(screen.getByLabelText('uncontrolled 닉네임'), 'abc');
    const typed = countOf(UNCONTROLLED);

    expect(mounted).toBe(2);
    expect(typed).toBe(2);

    // 화면은 그대로지만 값은 DOM 안에 들어 있다 — 눌러야 꺼내진다
    expect(screen.getByText('읽어온 값:')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '값 읽기' }));
    expect(screen.getByText('읽어온 값: abc')).toBeInTheDocument();
    expect(countOf(UNCONTROLLED)).toBe(4);
  });

  it('StrictMode 를 벗기면 마운트가 1, 세 글자 뒤가 4다', async () => {
    render(<ControlledInput />);

    expect(countOf(CONTROLLED)).toBe(1);
    await userEvent.type(screen.getByLabelText('controlled 닉네임'), 'abc');
    expect(countOf(CONTROLLED)).toBe(4);
  });

  // 과제 [탐구] 근거 — value 만 주고 onChange 를 빼면 글자가 아예 안 들어간다
  it('controlled 입력창에서 onChange 를 빼면 값이 고정되고 경고가 뜬다', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function FrozenInput() {
      return <input aria-label="얼어붙은 닉네임" value="jaehoon" />;
    }

    render(<FrozenInput />);
    await userEvent.type(screen.getByLabelText('얼어붙은 닉네임'), 'abc');

    expect(screen.getByLabelText<HTMLInputElement>('얼어붙은 닉네임').value).toBe('jaehoon');
    const messages = errorSpy.mock.calls.map((call) => String(call[0])).join('\n');
    expect(messages).toContain(
      'You provided a `value` prop to a form field without an `onChange` handler',
    );
    errorSpy.mockRestore();
  });
});
