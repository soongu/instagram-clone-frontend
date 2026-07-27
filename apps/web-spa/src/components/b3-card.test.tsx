// apps/web-spa/src/components/b3-card.test.tsx
// B-3 — 이름 붙인 슬롯을 가진 Card (내부 검증용)
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { Card } from './Card';
import { Section } from './Section';

describe('Card — 자식이 들어갈 자리가 셋이다', () => {
  it('머리·본문·꼬리를 각자 자리에 그린다', () => {
    render(
      <Card header={<h3>jaehoon</h3>} footer={<button>댓글 달기</button>}>
        <p>오늘 한강 노을이 미쳤다</p>
      </Card>,
    );

    const card = screen.getByRole('article');
    expect(card).toHaveTextContent('jaehoon');
    expect(card).toHaveTextContent('오늘 한강 노을이 미쳤다');
    expect(screen.getByRole('button', { name: '댓글 달기' })).toBeInTheDocument();
  });

  it('화면에 나오는 순서는 머리 → 본문 → 꼬리다', () => {
    const html = renderToStaticMarkup(
      <Card header={<p>머리</p>} footer={<p>꼬리</p>}>
        <p>본문</p>
      </Card>,
    );

    expect(html).toBe('<article><p>머리</p><p>본문</p><p>꼬리</p></article>');
  });

  it('props 를 적는 순서를 바꿔도 화면 순서는 그대로다', () => {
    const html = renderToStaticMarkup(
      <Card footer={<p>꼬리</p>} header={<p>머리</p>}>
        <p>본문</p>
      </Card>,
    );

    expect(html).toBe('<article><p>머리</p><p>본문</p><p>꼬리</p></article>');
  });

  it('생김새는 쓰는 쪽이 넘긴 class 로 정해진다', () => {
    const html = renderToStaticMarkup(
      <Card className="post-card" header={<p>머리</p>}>
        <p>본문</p>
      </Card>,
    );

    expect(html).toBe('<article class="post-card"><p>머리</p><p>본문</p></article>');
  });
});

describe('Card — 슬롯을 안 넘기면 그 자리는 아예 안 그려진다', () => {
  it('머리도 꼬리도 없으면 본문만 남는다', () => {
    const html = renderToStaticMarkup(
      <Card>
        <p>본문</p>
      </Card>,
    );

    expect(html).toBe('<article><p>본문</p></article>');
  });

  it('머리만 넘기면 꼬리 자리에 빈 껍데기도 안 남는다', () => {
    const html = renderToStaticMarkup(
      <Card header={<p>머리</p>}>
        <p>본문</p>
      </Card>,
    );

    expect(html).toBe('<article><p>머리</p><p>본문</p></article>');
  });
});

describe('Card — 본문에는 여러 개를 넣을 수 있다', () => {
  it('넣은 순서대로 이어서 그린다', () => {
    const html = renderToStaticMarkup(
      <Card header={<p>머리</p>}>
        <p>첫째</p>
        <p>둘째</p>
      </Card>,
    );

    expect(html).toBe('<article><p>머리</p><p>첫째</p><p>둘째</p></article>');
  });
});

describe('입구가 하나뿐인 Section 과의 차이', () => {
  it('Section 은 넘긴 순서가 곧 화면 순서라 실수하면 그대로 뒤집힌다', () => {
    const html = renderToStaticMarkup(
      <Section title="게시물">
        <p>꼬리</p>
        <p>머리</p>
      </Section>,
    );

    expect(html).toBe(
      '<section class="section" aria-label="게시물">' +
        '<h2 class="section-title">게시물</h2><p>꼬리</p><p>머리</p></section>',
    );
  });

  it('Card 는 같은 실수를 해도 자리가 이름으로 정해져 있다', () => {
    const html = renderToStaticMarkup(
      <Card footer={<p>꼬리</p>} header={<p>머리</p>}>
        <p>본문</p>
      </Card>,
    );

    expect(html.indexOf('머리')).toBeLessThan(html.indexOf('본문'));
    expect(html.indexOf('본문')).toBeLessThan(html.indexOf('꼬리'));
  });
});
