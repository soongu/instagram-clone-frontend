import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ResponseCheckDemo } from './ResponseCheckDemo';

// 교안 Step 6~7 — 같은 응답을 손 가드와 스키마가 다르게 판정하는 것을 화면으로 본다.
describe('B6 Step 6~7 — 응답 검사 데모', () => {
  it('성한 응답은 양쪽 다 통과라고 말한다', () => {
    render(<ResponseCheckDemo />);
    const panel = screen.getByRole('region', { name: '성한 응답' });

    expect(within(panel).getByText('isPost: 통과')).toBeInTheDocument();
    expect(within(panel).getByText('스키마: 통과')).toBeInTheDocument();
  });

  it('망가진 응답은 손 가드만 통과시킨다', () => {
    render(<ResponseCheckDemo />);
    const panel = screen.getByRole('region', { name: '망가진 응답' });

    expect(within(panel).getByText('isPost: 통과')).toBeInTheDocument();
    expect(within(panel).getByText('스키마: 막힘')).toBeInTheDocument();
  });

  it('스키마가 잡아낸 칸을 이름과 함께 보여준다', () => {
    render(<ResponseCheckDemo />);
    const panel = screen.getByRole('region', { name: '망가진 응답' });

    expect(within(panel).getAllByRole('listitem')).toHaveLength(7);
    expect(within(panel).getByText(/^profileImageUrl/)).toBeInTheDocument();
    expect(within(panel).getByText(/^createdAt/)).toBeInTheDocument();
  });
});
