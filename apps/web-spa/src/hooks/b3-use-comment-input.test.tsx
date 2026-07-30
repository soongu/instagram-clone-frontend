// apps/web-spa/src/hooks/b3-use-comment-input.test.tsx
// B-3 Step 8 — 폼에서 훅을 뽑아내도 동작이 100% 그대로인지 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToStaticMarkup } from 'react-dom/server';
import { toB3Classes, b3BridgeHits } from '../../scratch/e2-b3-class-bridge';
import { describe, it, expect, vi } from 'vitest';
import { CommentForm } from '../components/CommentForm';
import { CommentFormStep7 } from '../../scratch/b3-lecture-snapshots';

// 뽑아내기 전과 후를 나란히 돌려 같은 결과가 나오는지 본다
const forms = [
  ['뽑아내기 전', CommentFormStep7],
  ['뽑아낸 뒤', CommentForm],
] as const;

describe('CommentForm — 훅으로 뽑아내도 그리는 결과가 같다', () => {
  it('첫 화면 HTML 이 글자 하나 안 다르다', () => {
    const before = renderToStaticMarkup(<CommentFormStep7 onSubmit={() => {}} />);
    const after = renderToStaticMarkup(<CommentForm onSubmit={() => {}} />);

    // E-2 가 폼을 토큰 유틸리티로 옮겼으므로 견주기 전에 옛 이름으로 되돌린다
    expect(b3BridgeHits(after)).toContain('comment-form');
    expect(toB3Classes(after)).toBe(toB3Classes(before));
  });
});

describe.each(forms)('%s — 폼의 세 가지 약속', (_name, Form) => {
  it('빈 입력은 제출을 막는다 — 버튼이 잠겨 있고 엔터로도 안 나간다', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Form onSubmit={onSubmit} />);

    expect(screen.getByRole('button', { name: '게시' })).toBeDisabled();

    await user.type(screen.getByLabelText('댓글 입력'), '   {Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('앞뒤 공백을 털어낸 값이 부모에게 올라간다', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Form onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('댓글 입력'), '  노을 최고  ');
    await user.click(screen.getByRole('button', { name: '게시' }));

    expect(onSubmit).toHaveBeenCalledWith('노을 최고');
  });

  it('제출하고 나면 입력창이 비워지고 버튼이 다시 잠긴다', async () => {
    const user = userEvent.setup();
    render(<Form onSubmit={() => {}} />);

    const input = screen.getByLabelText('댓글 입력');
    await user.type(input, '노을 최고');
    await user.click(screen.getByRole('button', { name: '게시' }));

    expect(input).toHaveValue('');
    expect(screen.getByRole('button', { name: '게시' })).toBeDisabled();
  });

  it('제출하고 나면 입력창에 다시 커서가 돌아온다', async () => {
    const user = userEvent.setup();
    render(<Form onSubmit={() => {}} />);

    const input = screen.getByLabelText('댓글 입력');
    await user.type(input, '노을 최고');
    await user.click(screen.getByRole('button', { name: '게시' }));

    expect(input).toHaveFocus();
  });

  it('연달아 두 번 달아도 각각 올라간다', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Form onSubmit={onSubmit} />);

    const input = screen.getByLabelText('댓글 입력');
    await user.type(input, '노을 최고');
    await user.click(screen.getByRole('button', { name: '게시' }));
    await user.type(input, '어디예요?');
    await user.click(screen.getByRole('button', { name: '게시' }));

    expect(onSubmit).toHaveBeenNthCalledWith(1, '노을 최고');
    expect(onSubmit).toHaveBeenNthCalledWith(2, '어디예요?');
  });
});
