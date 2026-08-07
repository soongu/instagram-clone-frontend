// apps/web-spa/src/components/e4-dark-mode.test.tsx
// E-4 — 중단점 토큰과 다크모드 (내부 검증용)
//
// globals.css 와 빌드 산출 CSS 는 여기서 못 본다(E-1 때와 같은 이유).
// 미디어 쿼리가 실제로 갈리는 폭·다크 팔레트 픽셀·대비비는
// scratch/e4-dark-observations.txt 에 재현 명령과 함께 적어 뒀다.
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { App } from '../App';
import { Feed } from './Feed';
import { PostCard } from './PostCard';
import { SignUpForm } from './SignUpForm';
import { feedPosts } from '../data/feed';

describe('Step 1 — 두 열로 갈리는 자리에 우리 이름을 준다', () => {
  it('바깥 통은 우리 중단점에서 폭을 넓힌다', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('class="mx-auto max-w-[470px] py-4 sm:px-4 2col:max-w-[996px]"');
  });

  it('피드 목록은 우리 중단점에서 두 열이 된다', () => {
    const html = renderToStaticMarkup(<Feed posts={feedPosts} onToggleLike={() => {}} />);

    expect(html).toContain('class="2col:grid 2col:grid-cols-2 2col:gap-6"');
  });

  it('카드 아래 여백은 두 열이 되는 순간 gap 에게 넘긴다', () => {
    const html = renderToStaticMarkup(<PostCard {...feedPosts[0]} onToggleLike={() => {}} />);

    expect(html).toContain('bg-surface 2col:mb-0');
  });

  it('회원가입 폼은 통이 넓어져도 따라 늘어나지 않는다', () => {
    const html = renderToStaticMarkup(<SignUpForm onSubmit={() => {}} />);

    expect(html).toContain('p-4 2col:max-w-[470px]');
  });

  it('Tailwind 가 준 lg 는 더 이상 쓰지 않는다 — 우리 숫자로 갈린다', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).not.toMatch(/\blg:/);
  });
});

describe('Step 5·6 — 다크 값은 토큰 한 곳에서 갈린다', () => {
  // 값이 갈리는 것 자체는 globals.css 안이라 여기서 못 본다.
  // 여기서 지키는 것은 "그 대신 className 이 하나도 안 늘었다" 는 쪽이다.
  it('색을 쓰는 곳 어디에도 dark: 짝이 붙지 않았다', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).not.toMatch(/dark:/);
  });

  it('카드는 다크모드 전과 똑같은 이름을 쓴다 — 값만 갈린다', () => {
    const html = renderToStaticMarkup(<PostCard {...feedPosts[0]} onToggleLike={() => {}} />);

    expect(html).toContain('border border-line bg-surface');
    expect(html).not.toContain('surface-dark');
  });

  it('보조 문구와 폼 라벨도 이름 그대로다', () => {
    const feed = renderToStaticMarkup(<Feed posts={feedPosts} onToggleLike={() => {}} />);
    const form = renderToStaticMarkup(<SignUpForm onSubmit={() => {}} />);

    expect(feed).toContain('text-muted');
    expect(form).toContain('text-subtle');
  });
});
