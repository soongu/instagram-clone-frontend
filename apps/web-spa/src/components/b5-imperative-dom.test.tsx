import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileImagePicker } from './ProfileImagePicker';
import { CommentForm } from './CommentForm';

// 교안 Step 2 가 인용하는 동작은 전부 여기서 확인한다.
describe('B5 Step 2 — useRef 로 시키는 일', () => {
  it('버튼을 누르면 숨겨둔 파일 입력이 대신 열린다', async () => {
    render(<ProfileImagePicker />);

    const fileInput = screen.getByLabelText('프로필 사진 파일');
    const openPicker = vi.fn();
    fileInput.addEventListener('click', openPicker);

    await userEvent.click(screen.getByRole('button', { name: '프로필 사진 고르기' }));

    // 사용자가 누른 건 우리 버튼인데, 실제로 클릭이 도달한 건 파일 입력이다
    expect(openPicker).toHaveBeenCalledTimes(1);
  });

  it('고른 파일 이름이 화면에 뜨고 위로도 올라간다', async () => {
    const handlePick = vi.fn();
    render(<ProfileImagePicker onPick={handlePick} />);

    expect(screen.getByText('아직 고르지 않았어요')).toBeInTheDocument();

    const file = new File(['fake'], 'hangang.png', { type: 'image/png' });
    await userEvent.upload(screen.getByLabelText<HTMLInputElement>('프로필 사진 파일'), file);

    expect(screen.getByText('hangang.png')).toBeInTheDocument();
    expect(handlePick).toHaveBeenCalledWith('hangang.png');
  });

  // 파일 입력은 controlled 로 만들 수 없다 — 시작값을 주는 두 길이 모두 막힌다.
  // ⚠️ 던지는 문구는 jsdom 구현체의 것이라 교안에 문자열로 인용하지 않는다(동작만 인용).
  it('파일 입력에는 value 도 defaultValue 도 줄 수 없다', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function ControlledFileInput() {
      return <input type="file" value="hangang.png" onChange={() => {}} aria-label="막힌 파일 입력" />;
    }
    function DefaultedFileInput() {
      return <input type="file" defaultValue="hangang.png" aria-label="막힌 파일 입력 2" />;
    }

    expect(() => render(<ControlledFileInput />)).toThrow(/filename/);
    expect(() => render(<DefaultedFileInput />)).toThrow(/filename/);

    errorSpy.mockRestore();
  });

  it('댓글을 올리면 입력창이 다시 focus 된다 (A-4·B-3 에서 이미 쓰던 명령)', async () => {
    render(<CommentForm onSubmit={() => {}} />);

    const input = screen.getByLabelText('댓글 입력');
    await userEvent.type(input, '한강 좋네요');
    await userEvent.click(screen.getByRole('button', { name: '게시' }));

    expect(input).toHaveFocus();
  });

  it('focus 는 상태로는 표현할 수 없다 — 렌더 결과가 같아도 커서 위치가 다르다', async () => {
    function TwoFields() {
      const firstRef = useRef<HTMLInputElement>(null);
      return (
        <div>
          <input aria-label="첫 칸" ref={firstRef} />
          <input aria-label="둘째 칸" />
          <button type="button" onClick={() => firstRef.current?.focus()}>
            첫 칸으로
          </button>
        </div>
      );
    }

    render(<TwoFields />);
    await userEvent.click(screen.getByLabelText('둘째 칸'));
    expect(screen.getByLabelText('둘째 칸')).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: '첫 칸으로' }));
    expect(screen.getByLabelText('첫 칸')).toHaveFocus();
  });
});
