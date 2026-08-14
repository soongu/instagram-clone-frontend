import { describe, expect, it, beforeEach, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfirmStore } from '../stores/useConfirmStore';
import { ConfirmDialog } from './ConfirmDialog';
import { CommentList } from './CommentList';

// C-3 Step 1 과 같은 모양의 커스텀 훅 — 비교 대조군이다.
function useLocalRequest() {
  const [message, setMessage] = useState<string | null>(null);

  return { message, setMessage };
}

function LocalWriter() {
  const { setMessage } = useLocalRequest();

  return (
    <button type="button" onClick={() => setMessage('훅으로 쓴 값')}>
      훅으로 쓰기
    </button>
  );
}

function LocalReader() {
  const { message } = useLocalRequest();

  return <p>{`훅: ${message ?? '없음'}`}</p>;
}

// 상자를 여는 쪽. store 훅을 자기가 직접 부른다.
function AskButton({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  const ask = useConfirmStore((state) => state.ask);

  return (
    <button type="button" onClick={() => ask(`${label} 를 지울까요?`, onConfirm)}>
      {label} 지우기
    </button>
  );
}

// 지금 무엇을 물어보는 중인지 읽기만 하는 쪽. 위와 아무 관계가 없다.
function AskLabel() {
  const request = useConfirmStore((state) => state.request);

  return <p>{request === null ? '(물어보는 중 아님)' : request.message}</p>;
}

beforeEach(() => {
  useConfirmStore.setState({ request: null });
});

describe('store 를 만들면 그게 곧 훅이다', () => {
  it('두 곳에서 따로 불러도 값은 한 벌이다', async () => {
    const user = userEvent.setup();

    // 감싸는 것이 하나도 없다 — Provider 도 문맥도 없이 그냥 그린다
    render(
      <>
        <AskButton label="댓글" onConfirm={vi.fn()} />
        <AskLabel />
      </>,
    );

    expect(screen.getByText('(물어보는 중 아님)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '댓글 지우기' }));

    // 버튼이 부른 값을 라벨이 그대로 읽는다
    expect(screen.getByText('댓글 를 지울까요?')).toBeInTheDocument();
  });

  it('묻고 확인하면 그때 넘긴 일이 실행된다', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(<AskButton label="게시물" onConfirm={onConfirm} />);
    await user.click(screen.getByRole('button', { name: '게시물 지우기' }));

    expect(useConfirmStore.getState().request?.message).toBe('게시물 를 지울까요?');
    expect(onConfirm).not.toHaveBeenCalled();

    useConfirmStore.getState().confirm();

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(useConfirmStore.getState().request).toBeNull();
  });

  it('같은 자리에 커스텀 훅을 쓰면 값이 두 벌로 갈린다 — store 는 안 갈린다', async () => {
    const user = userEvent.setup();

    render(
      <>
        <LocalWriter />
        <LocalReader />
        <AskButton label="댓글" onConfirm={vi.fn()} />
        <AskLabel />
      </>,
    );

    await user.click(screen.getByRole('button', { name: '훅으로 쓰기' }));
    await user.click(screen.getByRole('button', { name: '댓글 지우기' }));

    // 훅은 쓴 쪽과 읽는 쪽의 useState 가 따로라 읽는 쪽이 모른다
    expect(screen.getByText('훅: 없음')).toBeInTheDocument();
    // store 는 한 벌이라 읽는 쪽이 그대로 본다
    expect(screen.getByText('댓글 를 지울까요?')).toBeInTheDocument();
  });

  it('상자를 그리는 자리가 위든 아래든 옆이든 상관없다', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    // 상자가 목록보다 먼저 그려지고, 같은 부모도 아니다.
    // Context 라면 Provider 가 위에 있어야 하지만 store 에는 위아래가 없다.
    render(
      <>
        <section>
          <ConfirmDialog />
        </section>
        <article>
          <CommentList comments={[{ id: 7, content: '노을' }]} onRemove={onRemove} />
        </article>
      </>,
    );

    await user.click(screen.getByRole('button', { name: '댓글 삭제' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '지우기' }));
    expect(onRemove).toHaveBeenCalledWith(7);
  });

  it('닫기만 하면 넘긴 일은 실행되지 않는다', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(<AskButton label="댓글" onConfirm={onConfirm} />);
    await user.click(screen.getByRole('button', { name: '댓글 지우기' }));

    useConfirmStore.getState().close();

    expect(onConfirm).not.toHaveBeenCalled();
    expect(useConfirmStore.getState().request).toBeNull();
  });
});
