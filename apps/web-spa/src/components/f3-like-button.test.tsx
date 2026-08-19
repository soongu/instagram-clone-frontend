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
});
