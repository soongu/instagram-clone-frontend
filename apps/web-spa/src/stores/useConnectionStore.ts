// apps/web-spa/src/stores/useConnectionStore.ts
import { create } from 'zustand';

// 지금 통로가 어떤 상태인지.
//   idle        — 아직 열지 않았다
//   connecting  — 여는 중이다
//   connected   — 열려 있다
//   offline     — 끊겼고 다시 붙는 중이다
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'offline';

interface ConnectionState {
  status: ConnectionStatus;

  // 끊긴 뒤 몇 번째 다시 붙기인지. 화면에 쓰지는 않지만
  // "몇 번 만에 붙었나" 를 확인할 때 쓴다.
  attempts: number;

  setStatus: (status: ConnectionStatus) => void;
  countAttempt: () => void;
  reset: () => void;
}

export const useConnectionStore = create<ConnectionState>()((set) => ({
  status: 'idle',
  attempts: 0,

  // 붙는 데 성공하면 시도 횟수는 처음으로 돌린다.
  setStatus: (status) => set(status === 'connected' ? { status, attempts: 0 } : { status }),

  countAttempt: () => set((current) => ({ attempts: current.attempts + 1 })),

  reset: () => set({ status: 'idle', attempts: 0 }),
}));
