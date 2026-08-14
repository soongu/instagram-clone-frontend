// apps/web-spa/src/stores/useConfirmStore.ts
import { create } from 'zustand';

// 지금 무엇을 물어보는 중인지. 물어볼 말과, 확인했을 때 할 일이 늘 함께 다닌다.
export interface ConfirmRequest {
  message: string;
  onConfirm: () => void;
}

interface ConfirmState {
  request: ConfirmRequest | null;
  ask: (message: string, onConfirm: () => void) => void;
  confirm: () => void;
  close: () => void;
}

// create 를 두 번 부르는 것처럼 보이는 이 모양(create<T>()(...))은 실수가 아니다.
// 타입은 우리가 적고, 함수 안의 set·get 타입은 TypeScript 가 알아내게 나눠 부른다.
export const useConfirmStore = create<ConfirmState>()((set, get) => ({
  request: null,

  ask: (message, onConfirm) => set({ request: { message, onConfirm } }),

  // 확인한 다음에 닫는다. 순서가 바뀌면 이미 지워진 요청을 부르게 된다.
  confirm: () => {
    get().request?.onConfirm();
    set({ request: null });
  },

  close: () => set({ request: null }),
}));
