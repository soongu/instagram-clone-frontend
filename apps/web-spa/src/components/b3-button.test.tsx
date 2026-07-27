// apps/web-spa/src/components/b3-button.test.tsx
// B-3 — children 으로 안쪽을 받는 공통 Button (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';
import { LikeButton } from './LikeButton';
import { CommentForm } from './CommentForm';

describe('Button — 안쪽은 쓰는 쪽이 정한다', () => {
  it('넘긴 글자를 그대로 그린다', () => {
    render(<Button>게시</Button>);

    expect(screen.getByRole('button', { name: '게시' })).toBeInTheDocument();
  });

  it('글자만이 아니라 태그가 섞인 자식도 그대로 받는다', () => {
    render(
      <Button>
        <strong>♥</strong> 좋아요 취소
      </Button>,
    );

    const button = screen.getByRole('button', { name: '♥ 좋아요 취소' });
    expect(button.querySelector('strong')).toHaveTextContent('♥');
  });

  it('누르면 부모가 준 함수를 부른다', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>좋아요</Button>);

    await user.click(screen.getByRole('button', { name: '좋아요' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 면 눌러도 아무 일이 없다', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button onClick={onClick} disabled>
        게시
      </Button>,
    );

    await user.click(screen.getByRole('button', { name: '게시' }));

    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('Button — type 을 안 적으면 제출 버튼이 아니다', () => {
  it('form 안에서 눌러도 제출이 일어나지 않는다', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const user = userEvent.setup();
    render(
      <form onSubmit={onSubmit}>
        <Button>그냥 버튼</Button>
      </form>,
    );

    await user.click(screen.getByRole('button', { name: '그냥 버튼' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('type="submit" 을 적어야 제출된다', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const user = userEvent.setup();
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">게시</Button>
      </form>,
    );

    await user.click(screen.getByRole('button', { name: '게시' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('아무것도 안 적은 button 태그는 form 안에서 제출을 일으킨다', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const user = userEvent.setup();
    render(
      <form onSubmit={onSubmit}>
        <button>그냥 버튼</button>
      </form>,
    );

    await user.click(screen.getByRole('button', { name: '그냥 버튼' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('LikeButton — 버튼을 갈아끼워도 동작은 그대로다', () => {
  it('누르면 부모가 준 함수를 부른다', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<LikeButton liked={false} likeCount={3} onToggle={onToggle} />);

    await user.click(screen.getByRole('button', { name: '♡ 좋아요' }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('좋아요 상태에 따라 글자와 클래스가 바뀐다', () => {
    render(<LikeButton liked likeCount={4} onToggle={() => {}} />);

    const button = screen.getByRole('button', { name: '♥ 좋아요 취소' });
    expect(button).toHaveClass('like-button', 'liked');
    expect(screen.getByText('좋아요 4개')).toBeInTheDocument();
  });

  it('달라진 것은 type="button" 이 붙은 것뿐이다', () => {
    const withButtonComponent = renderToStaticMarkup(
      <LikeButton liked={false} likeCount={3} onToggle={() => {}} />,
    );

    expect(withButtonComponent).toBe(
      '<div class="like-area"><button class="like-button" type="button">♡ 좋아요</button>' +
        '<p class="post-likes">좋아요 3개</p></div>',
    );
  });
});

describe('CommentForm — 제출 버튼도 Button 으로 바꾼다', () => {
  it('빈 입력이면 버튼이 잠겨 있다', () => {
    render(<CommentForm onSubmit={() => {}} />);

    expect(screen.getByRole('button', { name: '게시' })).toBeDisabled();
  });

  it('입력하고 누르면 내용이 부모로 올라가고 입력창이 비워진다', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CommentForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('댓글 입력'), '노을 최고');
    await user.click(screen.getByRole('button', { name: '게시' }));

    expect(onSubmit).toHaveBeenCalledWith('노을 최고');
    expect(screen.getByLabelText('댓글 입력')).toHaveValue('');
    expect(screen.getByLabelText('댓글 입력')).toHaveFocus();
  });
});
