import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { LoginForm, LoginSchema, CommentSchema, CommentListSchema } from '../../scratch/b6-story-answer';

// 과제 [구현] 예시답안 채증 — 로그인 스키마 + 댓글 응답 스키마
describe('과제 1 — 로그인 폼을 스키마로', () => {
  it('빈 채로 제출하면 두 칸에 메시지가 뜬다', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByText('사용자 이름을 입력해 주세요')).toBeInTheDocument();
    expect(screen.getByText('비밀번호를 입력해 주세요')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('제대로 채우면 제출 함수에 값이 들어간다', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText('사용자 이름'), 'jaehoon');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'sparta1234');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    // handleSubmit 은 값과 함께 제출 이벤트도 넘긴다 — 첫 인자만 본다
    expect(handleSubmit.mock.calls[0]?.[0]).toEqual({ username: 'jaehoon', password: 'sparta1234' });
  });

  it('로그인 스키마에는 길이 규칙이 없다 — 회원가입과 다른 판단', () => {
    // 회원가입이라면 막혔을 짧은 비밀번호도 로그인에서는 통과한다
    expect(LoginSchema.safeParse({ username: 'jh', password: 'a' }).success).toBe(true);
  });
});

describe('과제 2 — 댓글 응답 스키마', () => {
  const healthy = {
    id: 1,
    postId: 1,
    username: 'minji',
    content: '여기 어디예요?',
    createdAt: '2026-07-20T19:02:00',
  };

  it('성한 댓글은 통과한다', () => {
    expect(CommentSchema.safeParse(healthy).success).toBe(true);
    expect(CommentListSchema.safeParse([healthy, { ...healthy, id: 2 }]).success).toBe(true);
  });

  it('망가진 댓글에서 세 칸이 걸린다', () => {
    const broken = { ...healthy, postId: '1', content: null, createdAt: 0 };
    const result = CommentSchema.safeParse(broken);

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toEqual([
      'postId',
      'content',
      'createdAt',
    ]);
  });

  it('flattenError 로 칸별 메시지를 본다', () => {
    const broken = { ...healthy, postId: '1', content: null, createdAt: 0 };
    const { fieldErrors } = z.flattenError(CommentSchema.safeParse(broken).error!);

    expect(fieldErrors.postId).toEqual(['Invalid input: expected number, received string']);
    expect(fieldErrors.content).toEqual(['Invalid input: expected string, received null']);
  });
});
