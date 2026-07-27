// apps/web-spa/src/types/like-state.ts

// 네 상태가 공통으로 갖는 정보는 한 곳에만 적는다
interface LikeBase {
  liked: boolean;
}

// 상황마다 필요한 정보가 다르다 — 그래서 모양을 따로 만든다
interface LikeIdle extends LikeBase {
  status: 'idle';
}

interface LikePending extends LikeBase {
  status: 'pending';
}

interface LikeSuccess extends LikeBase {
  status: 'success';
  likeCount: number;
}

interface LikeFailed extends LikeBase {
  status: 'failed';
  message: string;
}

// status 가 판별 필드 — 이 값 하나로 어느 모양인지 정해진다
export type LikeState = LikeIdle | LikePending | LikeSuccess | LikeFailed;

export function likeButtonLabel(state: LikeState): string {
  switch (state.status) {
    case 'idle':
      return state.liked ? '좋아요 취소' : '좋아요';
    case 'pending':
      return '처리 중...';
    case 'success':
      return `좋아요 ${state.likeCount}`;
    case 'failed':
      return `실패 · ${state.message}`;
  }
}

// never 를 받는 함수는 "여기까지 올 수 없다"는 뜻이다
export function assertNever(value: never): never {
  throw new Error(`처리하지 않은 좋아요 상태입니다: ${JSON.stringify(value)}`);
}

export function likeButtonDisabled(state: LikeState): boolean {
  switch (state.status) {
    case 'pending':
      return true;
    case 'idle':
    case 'success':
    case 'failed':
      return false;
    default:
      return assertNever(state);
  }
}
