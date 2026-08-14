// apps/web-spa/src/components/e4-dark-mode.test.tsx
// E-4 — 중단점 토큰과 다크모드 (내부 검증용)
//
// globals.css 와 빌드 산출 CSS 는 여기서 못 본다(E-1 때와 같은 이유).
// 미디어 쿼리가 실제로 갈리는 폭·다크 팔레트 픽셀·대비비는
// scratch/e4-dark-observations.txt 에 재현 명령과 함께 적어 뒀다.
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { feedPosts } from '../data/feed';
import { FeedSection } from './FeedSection';
import { homeMarkup, withRouter } from '../../scratch/c1-router-harness';
import { Feed } from './Feed';
import { PostCard } from './PostCard';
import { SignUpForm } from './SignUpForm';

// E-7 에서 갈리는 조건이 창에서 통으로 옮겨갔다(--breakpoint-2col → --container-2col).
// 여기서 지키려던 것은 "우리가 지은 이름 하나로 두 열이 갈린다" 쪽이라
// 이름 앞의 @ 만 따라가고 지키는 내용은 그대로 둔다.
describe('Step 1 — 두 열로 갈리는 자리에 우리 이름을 준다', () => {
  it('바깥 통은 스스로 통이 되고 폭 상한을 하나만 갖는다', () => {
    // C-1 에서 이 껍데기가 Layout 으로 옮겨갔다. 라우터를 통해 그려야 함께 나온다.
    const html = homeMarkup();

    expect(html).toContain('class="@container mx-auto max-w-[996px] py-4 sm:px-4"');
  });

  it('피드 목록은 우리 이름에서 두 열이 된다', () => {
    const html = renderToStaticMarkup(withRouter(<Feed posts={feedPosts} onToggleLike={() => {}} />));

    expect(html).toContain('class="@2col:grid @2col:grid-cols-2 @2col:gap-6"');
  });

  it('카드 아래 여백은 두 열이 되는 순간 gap 에게 넘긴다', () => {
    const html = renderToStaticMarkup(withRouter(<PostCard {...feedPosts[0]} onToggleLike={() => {}} />));

    // E-6 에서 카드 몸통이 들여온 것으로 바뀌었다.
    // 여기서 지키려던 것은 "두 열이 되면 아래 여백을 gap 에게 넘긴다" 쪽이라 그것만 본다.
    expect(html).toContain('mb-6');
    expect(html).toContain('@2col:mb-0');
  });

  it('회원가입 폼은 통이 넓어져도 따라 늘어나지 않는다', () => {
    const html = renderToStaticMarkup(withRouter(<SignUpForm onSubmit={() => {}} />));

    expect(html).toContain('p-4 max-w-[470px]');
  });

  it('Tailwind 가 준 lg 는 더 이상 쓰지 않는다 — 우리 숫자로 갈린다', () => {
    const html = renderToStaticMarkup(withRouter(<FeedSection posts={feedPosts} />));

    // E-7 에서 통을 보는 @lg: 가 들어왔다. 이름은 같지만 다른 눈금이다
    // (창 lg: 는 64rem, 통 @lg: 는 32rem). 여기서 막으려던 것은 창 쪽이다.
    expect(html).not.toMatch(/(?<!@)\blg:/);
  });
});

describe('Step 5·6 — 다크 값은 토큰 한 곳에서 갈린다', () => {
  // 값이 갈리는 것 자체는 globals.css 안이라 여기서 못 본다.
  // 여기서 지키는 것은 "그 대신 className 이 하나도 안 늘었다" 는 쪽이다.
  // E-6 에서 들여온 컴포넌트가 자기 dark: 를 달고 들어왔다.
  // 그래서 "App 전체에 0개" 는 더 못 지킨다. 대신 지킬 것을 좁힌다 —
  // dark: 가 붙은 곳은 전부 들여온 것(data-slot 을 단 요소)이어야 한다.
  it('dark: 는 들여온 컴포넌트에만 있고 우리가 쓴 곳에는 없다', () => {
    const html = renderToStaticMarkup(withRouter(<FeedSection posts={feedPosts} />));
    const 태그들 = html.match(/<[^>]*dark:[^>]*>/g) ?? [];

    expect(태그들.length).toBeGreaterThan(0);
    for (const 태그 of 태그들) {
      expect(태그).toContain('data-slot=');
    }
  });

  it('우리가 손으로 쓴 화면에는 여전히 dark: 가 하나도 없다', () => {
    const form = renderToStaticMarkup(withRouter(<SignUpForm onSubmit={() => {}} />));

    expect(form).not.toMatch(/dark:/);
  });

  it('카드는 다크모드 전과 똑같은 이름을 쓴다 — 값만 갈린다', () => {
    const html = renderToStaticMarkup(withRouter(<PostCard {...feedPosts[0]} onToggleLike={() => {}} />));

    // 이름은 한 개다. 밝을 때와 어두울 때가 이 이름 뒤에서 갈린다.
    expect(html).toContain('bg-card');
    expect(html).not.toContain('surface-dark');
    expect(html).not.toContain('card-dark');
  });

  it('보조 문구와 폼 라벨도 이름 그대로다', () => {
    const feed = renderToStaticMarkup(withRouter(<Feed posts={feedPosts} onToggleLike={() => {}} />));
    const form = renderToStaticMarkup(withRouter(<SignUpForm onSubmit={() => {}} />));

    expect(feed).toContain('text-faint');
    expect(form).toContain('text-subtle');
  });
});
