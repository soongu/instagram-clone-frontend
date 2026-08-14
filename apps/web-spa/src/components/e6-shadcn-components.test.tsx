// apps/web-spa/src/components/e6-shadcn-components.test.tsx
// E-6 — 들여온 컴포넌트로 화면 만들기 (내부 검증용)
//
// 화면에 실제로 그려지는 색·여백·스크롤 잠금과 브라우저 포커스 이동은 여기서 못 본다.
// 그쪽 실측은 scratch/e6-shadcn-observations.txt 에 재현 명령과 함께 적어 뒀다.
import { renderToStaticMarkup } from 'react-dom/server';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';
import { buttonVariants } from './ui/button';
import { PostCard } from './PostCard';
import { PostModal } from './PostModal';
import { feedPosts } from '../data/feed';
import { withRouter } from '../../scratch/c1-router-harness';

const [firstPost] = feedPosts;

const modalProps = {
  username: 'jaehoon',
  profileImageUrl: '/jaehoon.jpg',
  imageUrl: '/post-1.jpg',
  content: '오늘 한강 노을이 미쳤다',
  likeCount: 1240,
  commentCount: 32,
};

describe('Step 2·3 — cva 가 고르고 cn 이 정리한다', () => {
  it('variant 와 size 는 이름으로 고르고 서로 다른 묶음을 낸다', () => {
    const 기본 = buttonVariants();
    const 다른것 = buttonVariants({ variant: 'outline', size: 'sm' });

    expect(기본).toContain('bg-primary');
    expect(다른것).not.toContain('bg-primary');
    expect(다른것).toContain('border-border');
  });

  it('겹치는 클래스는 뒤엣것만 남는다 — 그냥 이어붙이면 둘 다 남는다', () => {
    expect(['px-2.5', 'px-6'].join(' ')).toBe('px-2.5 px-6');
    expect(cn('px-2.5', 'px-6')).toBe('px-6');
    expect(cn('px-2.5 py-1 text-sm', 'px-6')).toBe('py-1 text-sm px-6');
  });

  it('겹치지 않으면 둘 다 남는다 — 덮을 수 있을 때만 지운다', () => {
    // p-4 는 px-6 을 통째로 덮으므로 앞엣것이 지워진다
    expect(cn('px-6', 'p-4')).toBe('p-4');
    // px-6 은 p-4 의 일부만 덮으므로 둘 다 살아남는다
    expect(cn('p-4', 'px-6')).toBe('p-4 px-6');
  });

  it('밖에서 넘긴 값이 안쪽 기본값을 밀어낸다', () => {
    const 정리전 = buttonVariants({ className: 'px-6' });
    const 정리후 = cn(buttonVariants({ className: 'px-6' }));

    expect(정리전).toContain('px-2.5');
    expect(정리후).not.toContain('px-2.5');
    expect(정리후).toContain('px-6');
  });

  it('우리 토큰이 들여온 토큰을 밀어낸다 — 단 다른 갈래끼리는 못 민다', () => {
    expect(cn('bg-card', 'bg-surface')).toBe('bg-surface');
    // ring 과 border 는 서로 다른 갈래다. 얹기만 하면 테두리가 두 겹이 된다.
    expect(cn('ring-1', 'border border-line')).toBe('ring-1 border border-line');
    expect(cn('ring-1', 'ring-0')).toBe('ring-0');
  });
});

describe('Step 4 — 붙어 있는 표시와 없는 함수', () => {
  it('들여온 조각마다 자기 이름표를 달고 온다', () => {
    const html = renderToStaticMarkup(withRouter(<PostCard {...firstPost} onToggleLike={() => {}} />));

    for (const 이름 of ['card', 'card-header', 'card-content', 'card-footer', 'avatar']) {
      expect(html).toContain(`data-slot="${이름}"`);
    }
  });

  it('부모가 자식의 이름표를 보고 자기 여백을 정한다', () => {
    const html = renderToStaticMarkup(withRouter(<PostCard {...firstPost} onToggleLike={() => {}} />));

    expect(html).toContain('has-data-[slot=card-footer]:pb-0');
  });
});

describe('Step 7 — 접근성이 딸려온다 (단 제목은 우리가 준다)', () => {
  it('여는 버튼은 무엇이 열릴지 미리 알린다', () => {
    render(withRouter(<PostModal {...modalProps} />));
    const 트리거 = screen.getByRole('button', { name: /모두 보기/ });

    expect(트리거).toHaveAttribute('aria-haspopup', 'dialog');
    expect(트리거).toHaveAttribute('aria-expanded', 'false');
  });

  it('열면 대화 상자로 읽히고 제목·설명이 이어진다', async () => {
    const user = userEvent.setup();
    render(withRouter(<PostModal {...modalProps} />));

    await user.click(screen.getByRole('button', { name: /모두 보기/ }));

    const 상자 = await screen.findByRole('dialog');
    expect(상자).toHaveAttribute('aria-labelledby');
    expect(상자).toHaveAttribute('aria-describedby');
    expect(상자.contains(document.activeElement)).toBe(true);
  });

  it('Esc 로 닫히고 포커스는 눌렀던 자리로 돌아온다', async () => {
    const user = userEvent.setup();
    render(withRouter(<PostModal {...modalProps} />));
    const 트리거 = screen.getByRole('button', { name: /모두 보기/ });

    await user.click(트리거);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');

    await waitFor(() => expect(트리거).toHaveAttribute('aria-expanded', 'false'));
    await waitFor(() => expect(document.activeElement).toBe(트리거));
  });
});

describe('우리가 고쳐 둔 곳 — add 를 다시 하면 날아가는 자리', () => {
  it('카드는 div 가 아니라 하나의 글로 읽힌다', () => {
    render(withRouter(<PostCard {...firstPost} onToggleLike={() => {}} />));

    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('닫기 버튼을 낭독기가 우리말로 읽는다', async () => {
    const user = userEvent.setup();
    render(withRouter(<PostModal {...modalProps} />));

    await user.click(screen.getByRole('button', { name: /모두 보기/ }));
    await screen.findByRole('dialog');

    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });
});
