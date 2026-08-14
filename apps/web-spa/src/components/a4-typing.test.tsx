// apps/web-spa/src/components/a4-typing.test.tsx
// A-4 — props·이벤트·children·ref 타이핑 (내부 검증용)
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { useRef } from 'react';
import { CommentForm } from './CommentForm';
import { CommentInput } from './CommentInput';
import { Section } from './Section';
import { feedPosts } from '../data/feed';
import { FeedSection } from './FeedSection';
import { withRouter } from '../../scratch/c1-router-harness';
import { withQuery } from '../../scratch/c5-query-harness';
import { FeedSectionBeforeServer } from '../../scratch/c6-feed-section-before';

describe('CommentInput — ref 를 props 로 받는다', () => {
  it('부모가 넘긴 ref 가 실제 input DOM 노드를 가리킨다', () => {
    let captured: HTMLInputElement | null = null;

    function Parent() {
      const inputRef = useRef<HTMLInputElement>(null);
      captured = inputRef.current;

      return (
        <>
          <CommentInput ref={inputRef} value="" onChange={() => {}} />
          <button onClick={() => (captured = inputRef.current)}>확인</button>
        </>
      );
    }

    render(<Parent />);
    screen.getByRole('button', { name: '확인' }).click();

    expect(captured).toBeInstanceOf(HTMLInputElement);
    expect(captured).toBe(screen.getByLabelText('댓글 입력'));
  });

  it('부모가 준 값과 핸들러를 그대로 쓴다', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    function Parent() {
      const inputRef = useRef<HTMLInputElement>(null);
      return <CommentInput ref={inputRef} value="노을" onChange={onChange} />;
    }

    render(<Parent />);
    expect(screen.getByLabelText('댓글 입력')).toHaveValue('노을');

    await user.type(screen.getByLabelText('댓글 입력'), '!');
    expect(onChange).toHaveBeenCalled();
  });
});

describe('CommentForm — 이름 붙인 핸들러와 ref', () => {
  it('게시하고 나면 입력창으로 커서가 돌아온다', async () => {
    const user = userEvent.setup();
    render(<CommentForm onSubmit={() => {}} />);

    const input = screen.getByLabelText('댓글 입력');
    await user.type(input, '노을 최고');
    await user.click(screen.getByRole('button', { name: '게시' }));

    expect(input).toHaveFocus();
  });

  it('엔터로 제출해도 화면이 새로 고쳐지지 않고 내용이 넘어간다', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CommentForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('댓글 입력'), '노을 최고{Enter}');

    expect(onSubmit).toHaveBeenCalledWith('노을 최고');
    expect(screen.getByLabelText('댓글 입력')).toHaveValue('');
  });
});

describe('Section — children 을 명시로 받는다', () => {
  it('제목과 자식을 함께 그린다', () => {
    render(
      <Section title="피드">
        <p>게시물이 여기에 들어간다</p>
      </Section>,
    );

    expect(screen.getByRole('heading', { name: '피드' })).toBeInTheDocument();
    expect(screen.getByText('게시물이 여기에 들어간다')).toBeInTheDocument();
  });

  it('자식이 여러 개여도 순서대로 그린다', () => {
    render(
      <Section title="피드">
        <p>첫째</p>
        <p>둘째</p>
      </Section>,
    );

    const section = screen.getByRole('region', { name: '피드' });
    expect(section).toHaveTextContent('첫째');
    expect(section).toHaveTextContent('둘째');
  });
});

// C-6 Step 3 에서 살아 있는 화면은 좋아요를 서버에 맡겼다.
// 이 아래가 재는 것은 "화면이 자기 안에서 바꾼다" 라서 그 시절 컴포넌트로 견준다.
describe('PostCard — 이미지 더블클릭으로 좋아요', () => {
  it('이미지를 더블클릭하면 좋아요가 켜진다', async () => {
    const user = userEvent.setup();
    render(withQuery(withRouter(<FeedSectionBeforeServer posts={feedPosts} />)));

    const [firstCard] = screen.getAllByRole('article');
    expect(within(firstCard).getByRole('button', { name: '좋아요', pressed: false })).toBeInTheDocument();

    await user.dblClick(within(firstCard).getByRole('img', { name: /게시물/ }));

    expect(
      within(firstCard).getByRole('button', { name: '좋아요', pressed: true }),
    ).toBeInTheDocument();
  });

  it('버튼으로 누른 것과 같은 상태를 공유한다', async () => {
    const user = userEvent.setup();
    render(withQuery(withRouter(<FeedSectionBeforeServer posts={feedPosts} />)));

    const [firstCard] = screen.getAllByRole('article');
    await user.dblClick(within(firstCard).getByRole('img', { name: /게시물/ }));
    await user.click(within(firstCard).getByRole('button', { name: '좋아요', pressed: true }));

    expect(within(firstCard).getByRole('button', { name: '좋아요', pressed: false })).toBeInTheDocument();
  });
});

describe('HomePage — 피드를 Section 으로 감싼다', () => {
  it('피드 섹션 안에 게시물 카드가 들어 있다', () => {
    render(withQuery(withRouter(<FeedSection posts={feedPosts} />)));

    const section = screen.getByRole('region', { name: '피드' });
    expect(within(section).getAllByRole('article')).toHaveLength(2);
  });
});
