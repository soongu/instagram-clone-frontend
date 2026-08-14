// apps/web-spa/src/components/b1-render.test.tsx
// B-1 교안에 인용할 컴포넌트가 실제로 렌더되는지 확인한다 (내부 검증용)
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { Avatar } from './Avatar';
import { PostCard } from './PostCard';
import { feedPosts } from '../data/feed';
import { FeedSection } from './FeedSection';
import { withRouter } from '../../scratch/c1-router-harness';
import { withQuery } from '../../scratch/c5-query-harness';

const [firstPost] = feedPosts;

describe('Avatar', () => {
  it('사용자 이름과 프로필 이미지를 그린다', () => {
    const html = renderToStaticMarkup(
      withRouter(<Avatar username="jaehoon" profileImageUrl="https://example.com/a.jpg" />),
    );

    expect(html).toContain('jaehoon');
    expect(html).toContain('https://example.com/a.jpg');
    // 감싸는 요소가 하나 있고 그 안에 이미지와 이름이 들어간다.
    // E-1 에서 Avatar 가 유틸리티로 넘어갔으므로 클래스 이름에 기대지 않는다.
    expect(html).toMatch(/<div [^>]*><img [^>]*\/><span[^>]*>jaehoon<\/span><\/div>/);
  });

  it('대체 텍스트에 사용자 이름을 넣는다', () => {
    const html = renderToStaticMarkup(
      withRouter(<Avatar username="minji" profileImageUrl="https://example.com/b.jpg" />),
    );

    expect(html).toContain('alt="minji 프로필 사진"');
  });
});

describe('PostCard', () => {
  it('props 로 받은 값을 화면 문자열로 그린다', () => {
    const html = renderToStaticMarkup(withRouter(<PostCard {...firstPost} onToggleLike={() => {}} />));

    expect(html).toContain('jaehoon');
    expect(html).toContain('오늘 한강 노을이');
    expect(html).toContain('좋아요 1240개');
    expect(html).toContain('댓글 32개 모두 보기');
  });

  it('Avatar 를 안에 품고 함께 그린다', () => {
    const html = renderToStaticMarkup(withRouter(<PostCard {...firstPost} onToggleLike={() => {}} />));

    // E-6 에서 프로필 자리가 들여온 Avatar 로 바뀌었다. 그쪽은 사진을 받아오기 전에는
    // 대체 글자만 그리므로, 여기서는 "카드가 프로필 자리를 품는다" 만 확인한다.
    expect(html).toContain('data-slot="avatar"');
    expect(html).toContain('<article data-slot="card"');
  });

  it('같은 컴포넌트가 다른 props 로 다른 화면을 낸다', () => {
    const [, secondPost] = feedPosts;
    const firstHtml = renderToStaticMarkup(withRouter(<PostCard {...firstPost} onToggleLike={() => {}} />));
    const secondHtml = renderToStaticMarkup(withRouter(<PostCard {...secondPost} onToggleLike={() => {}} />));

    expect(firstHtml).toContain('jaehoon');
    expect(secondHtml).toContain('minji');
    expect(firstHtml).not.toEqual(secondHtml);
  });
});

describe('HomePage', () => {
  it('카드 두 장을 나란히 그린다', () => {
    const html = renderToStaticMarkup(withQuery(withRouter(<FeedSection posts={feedPosts} />)));

    expect(html).toContain('jaehoon');
    expect(html).toContain('minji');
    expect(html.match(/<article data-slot="card"/g)).toHaveLength(2);
  });
});
