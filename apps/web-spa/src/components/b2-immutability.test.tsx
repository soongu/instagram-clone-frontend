// apps/web-spa/src/components/b2-immutability.test.tsx
// B-2 Step 6 반례 — 상태 안의 객체를 그 자리에서 고치면 화면이 안 바뀐다 (내부 검증용)
// 원본 데이터가 오염되지 않도록 이 반례만 따로 파일을 나눠 둔다.
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { BrokenApp } from '../../scratch/b2-broken-app';

describe('그 자리에서 고치면 화면이 안 바뀐다', () => {
  it('좋아요를 눌러도 헤더 숫자도 카드 숫자도 그대로다', async () => {
    const user = userEvent.setup();
    render(<BrokenApp />);

    expect(screen.getByText('좋아요 누른 게시물 1개')).toBeInTheDocument();

    const [firstCard] = screen.getAllByRole('article');
    await user.click(within(firstCard).getByRole('button', { name: /좋아요/ }));

    // 값은 바뀌었지만 배열 참조가 그대로라 React 가 다시 그리지 않는다
    expect(screen.getByText('좋아요 누른 게시물 1개')).toBeInTheDocument();
    expect(within(firstCard).getByText('좋아요 1240개')).toBeInTheDocument();
    expect(within(firstCard).getByRole('button', { name: /좋아요/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
