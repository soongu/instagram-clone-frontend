// apps/web-spa/src/components/e3-state-variants.test.tsx
// E-3 Step 1·2 — 상태 변형이 남은 손 규칙 두 개를 떼어낸다 (내부 검증용)
//
// globals.css 자체와 빌드 산출 CSS 는 여기서 못 본다(E-1 때와 같은 이유).
// 생성된 CSS 규칙 모양·픽셀·터치 기기 동작은 scratch/e3-variant-observations.txt 에
// 재현 명령과 함께 적어 뒀다.
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';

describe('Step 1 — 잠긴 상태를 disabled: 로 말한다', () => {
  it('교안이 인용하는 클래스 문자열 그대로 그린다', () => {
    const html = renderToStaticMarkup(<CommentForm onSubmit={() => {}} />);

    expect(html).toContain(
      'class="cursor-pointer text-sm font-semibold text-brand disabled:cursor-default disabled:text-brand/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"',
    );
  });

  it('손으로 지었던 comment-submit 이름은 더 이상 나오지 않는다', () => {
    const html = renderToStaticMarkup(<CommentForm onSubmit={() => {}} />);

    expect(html).not.toContain('comment-submit');
  });

  it('잠기는 조건 자체는 그대로다 — 빈 입력이면 disabled', () => {
    const html = renderToStaticMarkup(<CommentForm onSubmit={() => {}} />);

    expect(html).toContain('disabled=""');
  });
});

describe('Step 2 — 마우스를 올린 상태를 hover: 로 말한다', () => {
  const comments = [{ id: 1, content: '좋아요!' }];

  it('교안이 인용하는 클래스 문자열 그대로 그린다', () => {
    const html = renderToStaticMarkup(<CommentList comments={comments} onRemove={() => {}} />);

    expect(html).toContain(
      'class="cursor-pointer px-1 text-sm leading-none text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"',
    );
  });

  it('손으로 지었던 comment-remove 이름은 더 이상 나오지 않는다', () => {
    const html = renderToStaticMarkup(<CommentList comments={comments} onRemove={() => {}} />);

    expect(html).not.toContain('comment-remove');
  });

  it('onRemove 를 안 넘기면 삭제 버튼 자체가 없다 — B-3 규약은 그대로', () => {
    const html = renderToStaticMarkup(<CommentList comments={comments} />);

    expect(html).not.toContain('댓글 삭제');
  });
});
