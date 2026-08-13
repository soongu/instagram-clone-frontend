// apps/web-spa/src/components/a6-icon-button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { IconButton } from './IconButton';
import { HomePage } from '../routes/HomePage';

describe('IconButton — Button 이 받는 것을 그대로 받는다', () => {
  it('읽어줄 이름으로 찾을 수 있다', () => {
    render(<IconButton aria-label="게시물 메뉴">⋯</IconButton>);

    expect(screen.getByRole('button', { name: '게시물 메뉴' })).toHaveTextContent('⋯');
  });

  it('Button 에서 물려받은 onClick 이 그대로 동작한다', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton aria-label="닫기" onClick={onClick}>
        ×
      </IconButton>,
    );

    await user.click(screen.getByRole('button', { name: '닫기' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('Button 에서 물려받은 disabled 도 그대로 동작한다', () => {
    render(
      <IconButton aria-label="닫기" disabled>
        ×
      </IconButton>,
    );

    expect(screen.getByRole('button', { name: '닫기' })).toBeDisabled();
  });

  it('넘긴 class 가 그대로 붙는다 — 감싸도 화면에 남는 것은 달라지지 않는다', () => {
    render(
      <IconButton aria-label="닫기" className="comment-remove">
        ×
      </IconButton>,
    );

    expect(screen.getByRole('button', { name: '닫기' })).toHaveClass('comment-remove');
  });
});

describe('아이콘 버튼으로 바꾼 뒤에도 화면은 그대로다', () => {
  it('게시물 메뉴 버튼이 이름 그대로 남아 있다', () => {
    render(<HomePage />);

    expect(screen.getAllByRole('button', { name: '게시물 메뉴' })).toHaveLength(2);
  });
});
