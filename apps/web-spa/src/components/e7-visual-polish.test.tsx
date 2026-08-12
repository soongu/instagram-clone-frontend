// apps/web-spa/src/components/e7-visual-polish.test.tsx
// E-7 — 비주얼 완성 패스 (내부 검증용)
//
// 통이 실제로 몇 픽셀인지, 두 열이 언제 갈리는지, 움직임이 몇 밀리초인지는 여기서 못 본다.
// jsdom 은 배치를 안 하기 때문이다(E-4 때와 같은 이유).
// 그쪽 실측은 scratch/e7-visual-observations.txt 에 재현 명령과 함께 적어 뒀다.
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { App } from '../App';
import { Feed } from './Feed';
import { PostCard } from './PostCard';
import { SignUpForm } from './SignUpForm';
import { feedPosts } from '../data/feed';

describe('Step 2 — 갈리는 조건을 창에서 통으로 옮긴다', () => {
  it('바깥 통이 스스로 통이 된다고 선언한다', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('@container');
  });

  it('폭 상한이 하나로 줄었다 — 좁을 때는 통이 알아서 좁아진다', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('max-w-[996px]');
    expect(html).not.toContain('max-w-[470px] py-4');
  });

  // 이 단언이 이번 Step 의 핵심이다.
  // 토큰 이름을 --breakpoint-2col 에서 --container-2col 로 옮기면
  // 앞에 @ 가 없는 2col: 은 전부 죽은 글자가 된다.
  // Tailwind 는 이때 아무 경고도 안 내고, 클래스는 DOM 에 그대로 남는다.
  it('창을 보던 2col: 이 화면 어디에도 안 남았다', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).not.toMatch(/(?<!@)2col:/);
  });

  it('두 열로 갈리는 세 곳이 전부 통을 본다', () => {
    const feed = renderToStaticMarkup(<Feed posts={feedPosts} onToggleLike={() => {}} />);
    const card = renderToStaticMarkup(<PostCard {...feedPosts[0]} onToggleLike={() => {}} />);
    const form = renderToStaticMarkup(<SignUpForm onSubmit={() => {}} />);

    expect(feed).toContain('@2col:grid-cols-2');
    expect(card).toContain('@2col:mb-0');
    expect(form).toContain('@2col:max-w-[470px]');
  });
});
