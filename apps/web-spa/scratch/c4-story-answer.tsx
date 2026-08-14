// C-4 과제 예시답안이 실제로 동작하는지 확인하려고 만든 판 (내부 검증용)
//
// 과제 1: 게시물 삭제에도 같은 확인 상자를 쓴다
// 과제 2: 처리 중에는 새로 물어보지 못하게 막는다
// 과제 4: "멈출 것 같은데 안 멈추는" selector 여섯 번째
import { useReducer } from 'react';
import { create } from 'zustand';
import { useConfirmStore } from '../src/stores/useConfirmStore';
import { removeById } from '../src/lib/collections';
import { createFeedState, feedReducer, type FeedState } from '../src/lib/feed-state';
import type { Post } from '../src/types/instagram';
import { PostHeader } from '../src/components/PostHeader';

// ── 과제 1 ────────────────────────────────────────────────────────
// 머리 구역의 점 세 개에 삭제를 붙인다. PostHeader 는 onDelete 를 받기만 하고,
// 물어보는 일은 이 컴포넌트 바깥(카드)이 맡는다.
export function PostHeaderWithDelete({
  username,
  profileImageUrl,
  onDelete,
}: {
  username: string;
  profileImageUrl: string;
  onDelete: () => void;
}) {
  const ask = useConfirmStore((state) => state.ask);

  return (
    <div>
      <PostHeader username={username} profileImageUrl={profileImageUrl} />
      <button type="button" onClick={() => ask('이 게시물을 지울까요?', onDelete)}>
        게시물 삭제
      </button>
    </div>
  );
}

// 피드에서 게시물을 지우려면 리듀서에 일이 하나 늘어난다.
type AnswerFeedAction = Parameters<typeof feedReducer>[1] | { type: 'removePost'; id: number };

export function answerFeedReducer(state: FeedState, action: AnswerFeedAction): FeedState {
  if (action.type === 'removePost') {
    return { ...state, posts: removeById(state.posts, action.id) };
  }

  return feedReducer(state, action);
}

export function AnswerFeed({ posts }: { posts: Post[] }) {
  const [state, dispatch] = useReducer(answerFeedReducer, createFeedState(posts));

  return (
    <ul>
      {state.posts.map((post) => (
        <li key={post.id}>
          <PostHeaderWithDelete
            username={post.username}
            profileImageUrl={post.profileImageUrl}
            onDelete={() => dispatch({ type: 'removePost', id: post.id })}
          />
        </li>
      ))}
    </ul>
  );
}

// ── 과제 2 ────────────────────────────────────────────────────────
interface BusyConfirmState {
  request: { message: string; onConfirm: () => void | Promise<void> } | null;
  isBusy: boolean;
  ask: (message: string, onConfirm: () => void | Promise<void>) => void;
  confirm: () => Promise<void>;
  close: () => void;
}

export const useBusyConfirmStore = create<BusyConfirmState>()((set, get) => ({
  request: null,
  isBusy: false,

  // 처리 중이면 새 요청을 받지 않는다. 조용히 무시하는 대신 여기서 한 번만 막는다.
  ask: (message, onConfirm) => {
    if (get().isBusy) {
      return;
    }

    set({ request: { message, onConfirm } });
  },

  confirm: async () => {
    const { request, isBusy } = get();

    if (request === null || isBusy) {
      return;
    }

    set({ isBusy: true });

    try {
      await request.onConfirm();
    } finally {
      // 실패해도 잠금은 풀어야 한다. 안 그러면 영영 아무것도 못 물어본다.
      set({ request: null, isBusy: false });
    }
  },

  close: () => set({ request: null }),
}));

export function BusyConfirmDialog() {
  const request = useBusyConfirmStore((state) => state.request);
  const isBusy = useBusyConfirmStore((state) => state.isBusy);
  const confirm = useBusyConfirmStore((state) => state.confirm);

  if (request === null) {
    return null;
  }

  return (
    <div>
      <p>{request.message}</p>
      <button type="button" disabled={isBusy} onClick={() => void confirm()}>
        {isBusy ? '지우는 중…' : '지우기'}
      </button>
    </div>
  );
}

// ── 과제 4 ────────────────────────────────────────────────────────
// 객체를 돌려주는데도 안 멈춘다. 새로 만든 것이 아니라 store 안에 있던 그것이기 때문이다.
export function SixthSelector() {
  const request = useConfirmStore((state) => state.request);

  return <p>{`(f) ${request === null ? '닫힘' : request.message}`}</p>;
}

// 같은 이유로 안 멈추는 또 하나 — 늘 같은 하나를 돌려준다.
const NOTHING = { message: '(없음)' };

export function ConstantSelector() {
  const value = useConfirmStore((state) => state.request ?? NOTHING);

  return <p>{`(g) ${value.message}`}</p>;
}
