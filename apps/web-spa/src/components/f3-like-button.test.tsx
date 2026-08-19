// apps/web-spa/src/components/f3-like-button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LikeButton } from './LikeButton';

describe('좋아요 버튼', () => {
  it('역할과 이름으로 찾을 수 있다', () => {
    render(<LikeButton liked={false} likeCount={1240} onToggle={() => {}} />);

    const button = screen.getByRole('button', { name: '좋아요' });

    expect(button.tagName).toBe('BUTTON');
  });

  it('그 이름은 눈에 보이는 글자가 아니다', () => {
    render(<LikeButton liked={false} likeCount={1240} onToggle={() => {}} />);

    const button = screen.getByRole('button', { name: '좋아요' });

    // 버튼 안에는 하트 그림뿐이라 읽어 낼 글자가 없다
    expect(button.textContent).toBe('');
  });

  it('그래도 낭독기에는 이름이 있다', () => {
    render(<LikeButton liked={false} likeCount={1240} onToggle={() => {}} />);

    // 이름을 조건에 넣지 않고 찾은 다음, 그 이름이 무엇인지를 확인한다
    expect(screen.getByRole('button')).toHaveAccessibleName('좋아요');
  });

  it('눌렸다는 것은 이름이 아니라 눌림 표시로 드러난다', () => {
    render(<LikeButton liked={true} likeCount={1241} onToggle={() => {}} />);

    const button = screen.getByRole('button', { name: '좋아요' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });
});
