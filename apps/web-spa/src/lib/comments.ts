// apps/web-spa/src/lib/comments.ts
import type { DraftComment } from '../components/CommentList';
import { removeById } from './collections';

// 댓글 목록과 다음에 줄 번호는 늘 함께 움직인다 — 그래서 한 덩어리로 둔다
export interface CommentState {
  items: DraftComment[];
  nextId: number;
}

// 이 화면에서 일어날 수 있는 일 전부. type 하나로 갈라지는 판별 유니온이다
export type CommentAction =
  | { type: 'add'; content: string }
  | { type: 'remove'; id: number };

export const initialCommentState: CommentState = {
  items: [],
  nextId: 1,
};

// 지금 상태와 일어난 일을 받아 다음 상태를 돌려준다. 그게 전부다.
export function commentReducer(state: CommentState, action: CommentAction): CommentState {
  switch (action.type) {
    case 'add':
      return {
        items: [...state.items, { id: state.nextId, content: action.content }],
        nextId: state.nextId + 1,
      };

    case 'remove':
      return {
        ...state,
        items: removeById(state.items, action.id),
      };

    default: {
      // 위에서 빠뜨린 일이 있으면 이 줄에서 잡힌다
      const missed: never = action;
      return missed;
    }
  }
}
