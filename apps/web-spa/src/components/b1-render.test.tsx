// apps/web-spa/src/components/b1-render.test.tsx
// B-1 교안에 인용할 컴포넌트가 실제로 렌더되는지 확인한다 (내부 검증용)
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { Avatar } from './Avatar';
import { PostCard } from './PostCard';
import { App } from '../App';
import { feedPosts } from '../data/feed';

const [firstPost] = feedPosts;

describe('Avatar', () => {
  it('사용자 이름과 프로필 이미지를 그린다', () => {
    const html = renderToStaticMarkup(
      <Avatar username="jaehoon" profileImageUrl="https://example.com/a.jpg" />,
    );

    expect(html).toContain('jaehoon');
    expect(html).toContain('https://example.com/a.jpg');
    // 감싸는 요소가 하나 있고 그 안에 이미지와 이름이 들어간다.
    // E-1 에서 Avatar 가 유틸리티로 넘어갔으므로 클래스 이름에 기대지 않는다.
    expect(html).toMatch(/<div [^>]*><img [^>]*\/><span[^>]*>jaehoon<\/span><\/div>/);
  });

  it('대체 텍스트에 사용자 이름을 넣는다', () => {
    const html = renderToStaticMarkup(
      <Avatar username="minji" profileImageUrl="https://example.com/b.jpg" />,
    );

    expect(html).toContain('alt="minji 프로필 사진"');
  });
});

describe('PostCard', () => {
  it('props 로 받은 값을 화면 문자열로 그린다', () => {
    const html = renderToStaticMarkup(<PostCard {...firstPost} onToggleLike={() => {}} />);

    expect(html).toContain('jaehoon');
    expect(html).toContain('오늘 한강 노을이');
    expect(html).toContain('좋아요 1240개');
    expect(html).toContain('댓글 32개 모두 보기');
  });

  it('Avatar 를 안에 품고 함께 그린다', () => {
    const html = renderToStaticMarkup(<PostCard {...firstPost} onToggleLike={() => {}} />);

    // Avatar 만 내는 출력(대체 텍스트)으로 확인한다 — 클래스 이름은 E-1·E-2 에서 바뀐다
    expect(html).toContain('alt="jaehoon 프로필 사진"');
    expect(html).toContain('<article class="mb-6 overflow-hidden rounded-lg border border-line bg-surface">');
  });

  it('같은 컴포넌트가 다른 props 로 다른 화면을 낸다', () => {
    const [, secondPost] = feedPosts;
    const firstHtml = renderToStaticMarkup(<PostCard {...firstPost} onToggleLike={() => {}} />);
    const secondHtml = renderToStaticMarkup(<PostCard {...secondPost} onToggleLike={() => {}} />);

    expect(firstHtml).toContain('jaehoon');
    expect(secondHtml).toContain('minji');
    expect(firstHtml).not.toEqual(secondHtml);
  });
});

describe('App', () => {
  it('카드 두 장을 나란히 그린다', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('jaehoon');
    expect(html).toContain('minji');
    expect(html.match(/<article class="mb-6 /g)).toHaveLength(2);
  });
});
