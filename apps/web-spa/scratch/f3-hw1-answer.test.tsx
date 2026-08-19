// F-3 과제 1 예시답안 — 게시물 메뉴 버튼에 판을 쓴다
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostHeader } from '../src/components/PostHeader';

const props = { username: 'jaehoon', profileImageUrl: 'https://example.com/a.jpg' };

describe('게시물 머리 구역', () => {
  it('메뉴 버튼은 역할과 이름으로 찾힌다', () => {
    render(<PostHeader {...props} />);

    expect(screen.getByRole('button', { name: '게시물 메뉴' })).toBeInTheDocument();
  });

  it('그 이름도 눈에 보이는 글자가 아니다', () => {
    render(<PostHeader {...props} />);

    const button = screen.getByRole('button', { name: '게시물 메뉴' });

    // 좋아요 버튼과 같다 — 안에는 점 세 개 그림뿐이라 읽어 낼 글자가 없다
    expect(button.textContent).toBe('');
    expect(button).toHaveAccessibleName('게시물 메뉴');
  });

  it('사용자 이름은 그대로 글자로 보인다', () => {
    render(<PostHeader {...props} />);

    // 이쪽은 역할이 없는 span 이라 글자로 찾는 게 맞다
    expect(screen.getByText('jaehoon')).toBeInTheDocument();
  });

  it('머리 구역이 둘이면 이름만으로는 못 가른다', () => {
    render(
      <>
        <PostHeader username="jaehoon" profileImageUrl="https://example.com/a.jpg" />
        <PostHeader username="minji" profileImageUrl="https://example.com/b.jpg" />
      </>,
    );

    // 좋아요 버튼은 aria-pressed 로 갈렸지만 이 버튼에는 갈릴 상태가 없다
    expect(() => screen.getByRole('button', { name: '게시물 메뉴' })).toThrow();
    expect(screen.getAllByRole('button', { name: '게시물 메뉴' })).toHaveLength(2);
  });
});
