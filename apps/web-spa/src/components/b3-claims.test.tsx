// apps/web-spa/src/components/b3-claims.test.tsx
// B-3 교안 본문 주장이 화면에서도 사실인지 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import {
  SlotTakesScalars,
  SlotTakesNothing,
  SlotTakesComponent,
  ChildrenTakesArray,
  SlotKeepsOwnerState,
  ProfileCard,
} from '../../scratch/b3-claims';

describe('주장 1 — 슬롯은 JSX 가 아닌 값도 받는다', () => {
  it('문자열과 숫자를 그대로 그린다', () => {
    const html = renderToStaticMarkup(<SlotTakesScalars />);

    expect(html).toBe('<article class="profile-card">jaehoon노을 사진42</article>');
  });
});

describe('주장 2 — null·false 는 아무것도 안 그린다', () => {
  it('본문만 남는다', () => {
    const html = renderToStaticMarkup(<SlotTakesNothing />);

    expect(html).toBe('<article>노을 사진</article>');
  });
});

describe('주장 3 — 슬롯에 컴포넌트를 통째로 넣는다', () => {
  it('머리 자리에 넣은 컴포넌트가 그대로 그려진다', () => {
    render(<SlotTakesComponent />);

    expect(screen.getByText('jaehoon')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'jaehoon 프로필 사진' })).toBeInTheDocument();
  });
});

describe('주장 4 — 본문에 배열을 넣는다', () => {
  it('map 이 만든 해시태그가 순서대로 들어간다', () => {
    render(<ChildrenTakesArray />);

    const card = screen.getByRole('article');
    expect(card).toHaveTextContent('#한강');
    expect(card).toHaveTextContent('#노을');
  });
});

describe('주장 5 — 슬롯에 넣은 것의 상태는 넣은 쪽에 남는다', () => {
  it('꼬리 슬롯의 버튼이 머리 슬롯의 숫자를 바꾼다', async () => {
    const user = userEvent.setup();
    render(<SlotKeepsOwnerState />);

    expect(screen.getByText('좋아요 0개')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '좋아요' }));

    expect(screen.getByText('좋아요 1개')).toBeInTheDocument();
  });
});

describe('주장 6 — 같은 Card 로 게시물이 아닌 것도 조립한다', () => {
  it('프로필 카드도 같은 컴포넌트로 만들어진다', () => {
    render(<ProfileCard />);

    expect(screen.getByRole('heading', { name: 'jaehoon' })).toBeInTheDocument();
    expect(screen.getByText('게시물 42 · 팔로워 1240')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '팔로우' })).toBeInTheDocument();
  });
});
