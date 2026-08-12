// apps/web-spa/src/components/e7-visual-polish.test.tsx
// E-7 — 비주얼 완성 패스 (내부 검증용)
//
// 통이 실제로 몇 픽셀인지, 두 칸이 언제 갈리는지, 움직임이 몇 밀리초인지는 여기서 못 본다.
// jsdom 은 배치를 안 하기 때문이다(E-4 때와 같은 이유).
// 그쪽 실측은 scratch/e7-visual-observations.txt 에 재현 명령과 함께 적어 뒀다.
import { renderToStaticMarkup } from 'react-dom/server';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { App } from '../App';
import { Feed } from './Feed';
import { PostCard } from './PostCard';
import { PostModal } from './PostModal';
import { SignUpForm } from './SignUpForm';
import { feedPosts } from '../data/feed';

const [firstPost] = feedPosts;

const modalProps = {
  username: 'jaehoon',
  profileImageUrl: '/jaehoon.jpg',
  imageUrl: '/post-1.jpg',
  content: '오늘 한강 노을이 미쳤다',
  likeCount: 1240,
  commentCount: 32,
};

// 통이 넓을 때만 프로필 사진이 커진다. 카드와 모달에 똑같이 적혀 있고
// 갈리는 것은 담긴 통의 폭뿐이다.
const 넓을_때만 = '@lg:size-11';

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

  it('두 열로 갈리는 곳은 통을 본다', () => {
    const feed = renderToStaticMarkup(<Feed posts={feedPosts} onToggleLike={() => {}} />);
    const card = renderToStaticMarkup(<PostCard {...firstPost} onToggleLike={() => {}} />);

    expect(feed).toContain('@2col:grid-cols-2');
    expect(card).toContain('@2col:mb-0');
  });

  // 통을 재는 상자와 폭 상한은 같은 요소가 겸할 수 없다.
  // main 이 재는 쪽을 맡았으니 상한은 카드와 폼이 각자 갖는다.
  it('한 줄짜리 폭 상한은 카드와 폼이 직접 갖는다', () => {
    const card = renderToStaticMarkup(<PostCard {...firstPost} onToggleLike={() => {}} />);
    const form = renderToStaticMarkup(<SignUpForm onSubmit={() => {}} />);

    expect(card).toContain('max-w-[470px]');
    expect(form).toContain('max-w-[470px]');
    // 폼 쪽은 조건이 하나 없어졌다 — 통이 넓어져도 늘어날 일이 없어졌기 때문이다
    expect(form).not.toContain('@2col:max-w');
  });
});

describe('Step 3 — 같은 글자가 두 통에서 다르게 읽힌다', () => {
  // 이 단언이 이번 Step 의 핵심이다.
  // 카드 안과 모달 안에 글자가 똑같이 들어가 있다. 갈리는 것은 담긴 통의 폭뿐이라
  // 미디어 쿼리로는 이 둘을 다르게 만들 방법이 없다.
  it('카드 안과 모달 안에 똑같은 글자가 들어 있다', async () => {
    const user = userEvent.setup();
    const card = renderToStaticMarkup(<PostCard {...firstPost} onToggleLike={() => {}} />);

    expect(card).toContain(넓을_때만);

    render(<PostModal {...modalProps} />);
    await user.click(screen.getByRole('button', { name: /모두 보기/ }));
    const 상자 = await screen.findByRole('dialog');

    expect(상자.innerHTML).toContain(넓을_때만);
  });

  // 통을 선언 안 하면 카드 안쪽이 바깥 main 을 보고 갈려 버린다.
  it('카드가 스스로 통이 된다 — 안 그러면 바깥을 보고 갈린다', () => {
    const card = renderToStaticMarkup(<PostCard {...firstPost} onToggleLike={() => {}} />);

    expect(card).toContain('@container');
  });

  it('모달도 스스로 통이 되고, 갈릴 만큼 넓어졌다', async () => {
    const user = userEvent.setup();
    render(<PostModal {...modalProps} />);

    await user.click(screen.getByRole('button', { name: /모두 보기/ }));
    const 상자 = await screen.findByRole('dialog');

    expect(상자.className).toContain('@container');
    expect(상자.className).toContain('sm:max-w-4xl');
  });

  it('모달 안은 통이 넓어지면 사진과 글이 나란히 선다', async () => {
    const user = userEvent.setup();
    render(<PostModal {...modalProps} />);

    await user.click(screen.getByRole('button', { name: /모두 보기/ }));
    const 상자 = await screen.findByRole('dialog');

    expect(상자.innerHTML).toContain('@3xl:grid-cols-2');
  });

  // E-6 회수 — 제목을 빼면 이름 없는 대화 상자가 조용히 만들어진다.
  // 화면에서 안 보이게 하더라도 이름 자체는 남겨 둔다.
  it('화면에서 감췄어도 대화 상자 이름은 남아 있다', async () => {
    const user = userEvent.setup();
    render(<PostModal {...modalProps} />);

    await user.click(screen.getByRole('button', { name: /모두 보기/ }));
    const 상자 = await screen.findByRole('dialog');

    expect(상자).toHaveAttribute('aria-labelledby');
    expect(상자.innerHTML).toContain('sr-only');
    expect(상자.textContent).toContain('jaehoon 의 게시물');
  });
});
