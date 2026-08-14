// apps/web-spa/src/components/e7-visual-polish.test.tsx
// E-7 — 비주얼 완성 패스 (내부 검증용)
//
// 통이 실제로 몇 픽셀인지, 두 칸이 언제 갈리는지, 움직임이 몇 밀리초인지는 여기서 못 본다.
// jsdom 은 배치를 안 하기 때문이다(E-4 때와 같은 이유).
// 그쪽 실측은 scratch/e7-visual-observations.txt 에 재현 명령과 함께 적어 뒀다.
import { renderToStaticMarkup } from 'react-dom/server';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Ellipsis, MoreHorizontal } from 'lucide-react';
import { feedPosts } from '../data/feed';
import { FeedSection } from './FeedSection';
import { homeMarkup, withRouter } from '../../scratch/c1-router-harness';
import { Feed } from './Feed';
import { PostCard } from './PostCard';
import { PostHeader } from './PostHeader';
import { PostModal } from './PostModal';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';
import { TextField } from './TextField';
import { LikeButton } from './LikeButton';
import { SignUpForm } from './SignUpForm';

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
    const html = renderToStaticMarkup(withRouter(<FeedSection posts={feedPosts} />));

    expect(html).toContain('@container');
  });

  it('폭 상한이 하나로 줄었다 — 좁을 때는 통이 알아서 좁아진다', () => {
    // C-1 에서 이 껍데기가 Layout 으로 옮겨갔다. 라우터를 통해 그려야 함께 나온다.
    const html = homeMarkup();

    expect(html).toContain('max-w-[996px]');
    expect(html).not.toContain('max-w-[470px] py-4');
  });

  // 이 단언이 이번 Step 의 핵심이다.
  // 토큰 이름을 --breakpoint-2col 에서 --container-2col 로 옮기면
  // 앞에 @ 가 없는 2col: 은 전부 죽은 글자가 된다.
  // Tailwind 는 이때 아무 경고도 안 내고, 클래스는 DOM 에 그대로 남는다.
  it('창을 보던 2col: 이 화면 어디에도 안 남았다', () => {
    const html = renderToStaticMarkup(withRouter(<FeedSection posts={feedPosts} />));

    expect(html).not.toMatch(/(?<!@)2col:/);
  });

  it('두 열로 갈리는 곳은 통을 본다', () => {
    const feed = renderToStaticMarkup(withRouter(<Feed posts={feedPosts} onToggleLike={() => {}} />));
    const card = renderToStaticMarkup(withRouter(<PostCard {...firstPost} onToggleLike={() => {}} />));

    expect(feed).toContain('@2col:grid-cols-2');
    expect(card).toContain('@2col:mb-0');
  });

  // 통을 재는 상자와 폭 상한은 같은 요소가 겸할 수 없다.
  // main 이 재는 쪽을 맡았으니 상한은 카드와 폼이 각자 갖는다.
  it('한 줄짜리 폭 상한은 카드와 폼이 직접 갖는다', () => {
    const card = renderToStaticMarkup(withRouter(<PostCard {...firstPost} onToggleLike={() => {}} />));
    const form = renderToStaticMarkup(withRouter(<SignUpForm onSubmit={() => {}} />));

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
    const card = renderToStaticMarkup(withRouter(<PostCard {...firstPost} onToggleLike={() => {}} />));

    expect(card).toContain(넓을_때만);

    render(withRouter(<PostModal {...modalProps} />));
    await user.click(screen.getByRole('button', { name: /모두 보기/ }));
    const 상자 = await screen.findByRole('dialog');

    expect(상자.innerHTML).toContain(넓을_때만);
  });

  // 통을 선언 안 하면 카드 안쪽이 바깥 main 을 보고 갈려 버린다.
  it('카드가 스스로 통이 된다 — 안 그러면 바깥을 보고 갈린다', () => {
    const card = renderToStaticMarkup(withRouter(<PostCard {...firstPost} onToggleLike={() => {}} />));

    expect(card).toContain('@container');
  });

  it('모달도 스스로 통이 되고, 갈릴 만큼 넓어졌다', async () => {
    const user = userEvent.setup();
    render(withRouter(<PostModal {...modalProps} />));

    await user.click(screen.getByRole('button', { name: /모두 보기/ }));
    const 상자 = await screen.findByRole('dialog');

    expect(상자.className).toContain('@container');
    expect(상자.className).toContain('sm:max-w-4xl');
  });

  it('모달 안은 통이 넓어지면 사진과 글이 나란히 선다', async () => {
    const user = userEvent.setup();
    render(withRouter(<PostModal {...modalProps} />));

    await user.click(screen.getByRole('button', { name: /모두 보기/ }));
    const 상자 = await screen.findByRole('dialog');

    expect(상자.innerHTML).toContain('@3xl:grid-cols-2');
  });

  // E-6 회수 — 제목을 빼면 이름 없는 대화 상자가 조용히 만들어진다.
  // 화면에서 안 보이게 하더라도 이름 자체는 남겨 둔다.
  it('화면에서 감췄어도 대화 상자 이름은 남아 있다', async () => {
    const user = userEvent.setup();
    render(withRouter(<PostModal {...modalProps} />));

    await user.click(screen.getByRole('button', { name: /모두 보기/ }));
    const 상자 = await screen.findByRole('dialog');

    expect(상자).toHaveAttribute('aria-labelledby');
    expect(상자.innerHTML).toContain('sr-only');
    expect(상자.textContent).toContain('jaehoon 의 게시물');
  });
});

describe('Step 4 — 문자 자리에 아이콘을 놓는다', () => {
  const 더보기 = () => {
    render(withRouter(<PostHeader username="jaehoon" profileImageUrl="/jaehoon.jpg" />));
    return screen.getByRole('button', { name: '게시물 메뉴' });
  };

  it('문자가 사라지고 그림이 들어왔다 — 버튼 이름은 그대로다', () => {
    const more = 더보기();

    expect(more.textContent).toBe('');
    expect(more.querySelector('svg')).not.toBeNull();
  });

  // 이 단언이 이번 Step 의 핵심 하나다.
  // 우리는 아무것도 안 적었는데 그림이 스스로 낭독기에서 빠진다.
  // 대신 읽히는 이름은 버튼이 들고 있다 — A-6 에서 정한 그대로다.
  it('그림은 우리가 안 적어도 낭독기에서 빠진다', () => {
    const svg = 더보기().querySelector('svg');

    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  // 이 단언이 이번 Step 의 핵심 둘이다.
  // 검색하면 나오는 옛 이름으로 불러도 그대로 컴파일된다. 같은 것이기 때문이다.
  // 그런데 화면에 남는 이름은 우리가 부른 이름이 아니라 정식 이름이다.
  it('옛 이름으로 불러도 같은 것이 오고, 화면에 남는 것은 정식 이름이다', () => {
    expect(MoreHorizontal).toBe(Ellipsis);

    expect(더보기().querySelector('svg')?.getAttribute('class')).toContain('lucide-ellipsis');
  });

  // 버튼에는 지난 시간에 붙인 글자 크기가 그대로 남아 있다.
  // 그런데 그림은 그 값을 안 본다 — 자기 크기를 24px 로 갖고 온다.
  it('글자 크기로는 그림 크기가 안 바뀐다 — 크기는 따로 준다', () => {
    const more = 더보기();
    const svg = more.querySelector('svg');

    expect(more.className).toContain('text-lg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg?.getAttribute('class')).toContain('size-5');
  });

  // Step 3 의 아바타와 같은 조건을 쓴다. 카드에서는 20px, 모달에서는 24px.
  it('통이 넓어지면 그림도 커진다 — 아바타와 같은 조건', () => {
    expect(더보기().querySelector('svg')?.getAttribute('class')).toContain('@lg:size-6');
  });

  it('댓글 삭제 자리도 같은 방식으로 바뀌었다', () => {
    render(withRouter(<CommentList comments={[{ id: 1, content: '좋아요!' }]} onRemove={() => {}} />));
    const remove = screen.getByRole('button', { name: '댓글 삭제' });
    const svg = remove.querySelector('svg');

    expect(remove.textContent).toBe('');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg?.getAttribute('class')).toContain('lucide-x');
  });

  it('화면 어디에도 더보기 문자가 안 남았다 — 카드가 두 장이라 한 장만 고치면 남는다', () => {
    const html = renderToStaticMarkup(withRouter(<FeedSection posts={feedPosts} />));

    expect(html).not.toContain('⋯');
  });
});

describe('Step 5 — 좋아요 줄을 인스타그램처럼', () => {
  const 좋아요 = (liked: boolean) => {
    render(withRouter(<LikeButton liked={liked} likeCount={1240} onToggle={() => {}} />));
    return screen.getByRole('button', { name: '좋아요' });
  };

  it('테두리 버튼이 하트 아이콘이 됐다', () => {
    const button = 좋아요(false);

    expect(button.textContent).toBe('');
    expect(button.querySelector('svg')?.getAttribute('class')).toContain('lucide-heart');
  });

  // 이 단언이 이번 Step 의 핵심이다.
  // 글자가 있을 때는 이름이 '♡ 좋아요' 에서 '♥ 좋아요 취소' 로 바뀌면서
  // 상태까지 함께 알려줬다. 아이콘만 남으면 이름이 안 바뀐다.
  it('이름은 그대로고, 눌렸다는 것은 따로 알린다', () => {
    const { unmount } = render(withRouter(<LikeButton liked={false} likeCount={1240} onToggle={() => {}} />));

    expect(screen.getByRole('button', { name: '좋아요' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    unmount();
    render(withRouter(<LikeButton liked likeCount={1241} onToggle={() => {}} />));

    // 이름으로 찾는 방법이 그대로 통한다 — 바뀐 것은 눌림 표시뿐이다
    expect(screen.getByRole('button', { name: '좋아요' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('눈으로 보는 사람에게는 속을 채워서 알린다', () => {
    expect(좋아요(true).querySelector('svg')?.getAttribute('class')).toContain('fill-current');
  });

  it('누르면 같은 이름의 버튼이 눌린 상태로 바뀐다', async () => {
    const user = userEvent.setup();
    render(withRouter(<FeedSection posts={feedPosts} />));
    const 첫카드 = screen.getAllByRole('listitem')[0];

    await user.click(within(첫카드).getByRole('button', { name: '좋아요', pressed: false }));

    expect(within(첫카드).getByRole('button', { name: '좋아요', pressed: true })).toBeInTheDocument();
  });

  // 인스타그램에는 아이콘이 넷이지만 우리 앱에 있는 동작은 좋아요 하나다.
  // 흉내만 낸 버튼을 놓으면 낭독기 사용자에게 "누를 수 있다" 고 거짓말을 하게 된다.
  it('동작이 없는 아이콘은 줄에 놓지 않는다', () => {
    render(withRouter(<LikeButton liked={false} likeCount={1240} onToggle={() => {}} />));

    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('개수 줄은 그대로 남아 있다', () => {
    render(withRouter(<LikeButton liked={false} likeCount={1240} onToggle={() => {}} />));

    expect(screen.getByText('좋아요 1240개')).toBeInTheDocument();
  });

  it('화면 어디에도 하트 문자가 안 남았다', () => {
    const html = renderToStaticMarkup(withRouter(<FeedSection posts={feedPosts} />));

    expect(html).not.toContain('♡');
    expect(html).not.toContain('♥');
  });
});

describe('Step 6 — 누르면 반응하게', () => {
  const 하트버튼 = (liked: boolean) => {
    render(withRouter(<LikeButton liked={liked} likeCount={1240} onToggle={() => {}} />));
    return screen.getByRole('button', { name: '좋아요' });
  };

  it('누르는 동안 살짝 줄어든다', () => {
    const button = 하트버튼(false);

    expect(button.className).toContain('active:scale-90');
    expect(button.className).toContain('transition');
  });

  // 이 단언이 이번 Step 의 핵심이다.
  // 켤 때만 튀어야 한다. 끌 때도 튀면 취소가 축하처럼 보인다.
  it('켤 때만 튄다 — 끌 때는 조용하다', () => {
    expect(하트버튼(true).querySelector('svg')?.getAttribute('class')).toContain('zoom-in-50');
  });

  it('안 눌린 하트에는 튀는 글자가 없다', () => {
    expect(하트버튼(false).querySelector('svg')?.getAttribute('class')).not.toContain('zoom-in');
  });

  // E-6 에서 모달이 나타날 때 쓰던 그 꾸러미의 글자다.
  // 우리가 처음 직접 부르는 자리다.
  it('나타나는 움직임은 들여온 꾸러미의 글자를 쓴다', () => {
    expect(하트버튼(true).querySelector('svg')?.getAttribute('class')).toContain('animate-in');
  });
});

// 낭독기가 읽어줄 이름을 우리가 직접 계산해 본다.
// 규칙은 aria-label → aria-labelledby → label[for] → 안에 든 글자 순이다.
function 읽어줄이름(el: Element): string {
  const label = el.getAttribute('aria-label');
  if (label) return label.trim();
  const labelledby = el.getAttribute('aria-labelledby');
  if (labelledby) {
    return (labelledby.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '')).join(' ').trim();
  }
  if (el.id) {
    const forLabel = document.querySelector(`label[for="${el.id}"]`);
    if (forLabel?.textContent) return forLabel.textContent.trim();
  }
  if (el.tagName === 'IMG') return (el.getAttribute('alt') ?? '').trim();
  return (el.textContent ?? '').trim();
}

describe('Step 8 — 화면 전체를 훑는다', () => {
  it('조작할 수 있는 것에는 하나도 빠짐없이 읽어줄 이름이 있다', () => {
    render(withRouter(<FeedSection posts={feedPosts} />));

    const 이름없는것 = [...document.querySelectorAll('button, a, input, select, textarea, img')]
      .filter((el) => 읽어줄이름(el) === '')
      .map((el) => el.outerHTML.slice(0, 80));

    expect(이름없는것).toEqual([]);
  });

  // 하트(그림)는 3:1 이면 되지만 오류 글자는 4.5:1 이 필요하다.
  // 우리 빨강 하나로는 두 화면을 다 만족시킬 수 없어서 글자용을 따로 뒀다.
  it('오류 글자는 그림용 빨강이 아니라 글자용 빨강을 쓴다', () => {
    render(withRouter(<TextField id="email" label="이메일" name="email" error="이메일 형식이 아니에요" />));

    expect(screen.getByText('이메일 형식이 아니에요').className).toContain('text-danger-strong');
  });

  it('하트는 그대로 그림용 빨강이다', () => {
    render(withRouter(<LikeButton liked likeCount={1} onToggle={() => {}} />));

    const heart = screen.getByRole('button', { name: '좋아요' }).querySelector('svg');
    expect(heart?.getAttribute('class')).toContain('text-danger');
    expect(heart?.getAttribute('class')).not.toContain('text-danger-strong');
  });

  it('누를 자리가 24px 에 못 미치던 셋을 넓혔다', () => {
    render(withRouter(<CommentList comments={[{ id: 1, content: '노을 최고' }]} onRemove={() => {}} />));
    expect(screen.getByRole('button', { name: '댓글 삭제' }).className).toContain('p-1');

    render(withRouter(<CommentForm onSubmit={() => {}} />));
    expect(screen.getByRole('button', { name: '게시' }).className).toContain('py-1');
    expect(screen.getByLabelText('댓글 입력').className).toContain('py-1');
  });

  // 넓은 통에서 모달이 두 칸으로 갈리면 오른쪽 칸의 더보기가
  // 상자 오른쪽 위 닫기 버튼과 자리를 다툰다. 그 칸만 오른쪽을 비워둔다.
  it('모달이 두 칸일 때 오른쪽 칸은 닫기 버튼 자리를 비워둔다', async () => {
    const user = userEvent.setup();
    render(withRouter(<PostModal {...modalProps} />));

    await user.click(screen.getByRole('button', { name: /모두 보기/ }));
    const 상자 = await screen.findByRole('dialog');

    expect(상자.innerHTML).toContain('@3xl:pr-8');
  });
});
