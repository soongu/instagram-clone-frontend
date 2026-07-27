// apps/web-spa/src/components/a4-snapshots.test.tsx
// A-4 교안 중간 Step 코드가 실제로 동작하는지 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import {
  CommentFormBefore,
  CommentFormStep1,
  CommentFormStep2,
  LikeButtonStep3,
  CommentInputWithAlias,
  Badge,
} from '../../scratch/a4-lecture-snapshots';

describe('Step 1~2 — 핸들러를 밖으로 빼도 동작은 그대로다', () => {
  it.each([
    ['B-2 가 남긴 인라인 버전', CommentFormBefore],
    ['Step 1 — onChange 만 분리', CommentFormStep1],
    ['Step 2 — onSubmit 까지 분리', CommentFormStep2],
  ])('%s', async (_name, Form) => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Form onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('댓글 입력'), '노을 최고');
    await user.click(screen.getByRole('button', { name: '게시' }));

    expect(onSubmit).toHaveBeenCalledWith('노을 최고');
    expect(screen.getByLabelText('댓글 입력')).toHaveValue('');
  });
});

describe('Step 3 — 이벤트가 필요 없는 핸들러', () => {
  it('매개변수를 안 받는 함수도 onClick 자리에 들어간다', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<LikeButtonStep3 liked={false} likeCount={3} onToggle={onToggle} />);

    await user.click(screen.getByRole('button', { name: '♡ 좋아요' }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('핸들러 별칭으로 적은 props 도 똑같이 동작한다', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<CommentInputWithAlias value="" onChange={onChange} />);

    await user.type(screen.getByLabelText('댓글 입력'), '노');

    expect(onChange).toHaveBeenCalled();
  });
});

describe('Step 6 — children 을 안 받는 컴포넌트', () => {
  it('라벨만 그린다', () => {
    render(<Badge label="NEW" />);

    expect(screen.getByText('NEW')).toBeInTheDocument();
  });
});
