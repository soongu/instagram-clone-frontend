// apps/web-spa/src/stores/useSessionStore.ts
import { create } from 'zustand';

// 지금 누구로 들어와 있는지.
//
// 왜 store 인가 — 세 갈래로 따져보면 답이 나온다.
// 서버가 주인인 값이 아니고(로그인한 사람은 이 브라우저의 사정이다),
// 주소에 담을 것도 아니다(주소를 공유했는데 남이 나로 보이면 안 된다).
// 그런데 머리말도, 통로도, 대화창도 알아야 한다. 그래서 store 다.
interface SessionState {
  username: string | null;

  signIn: (username: string) => void;
  signOut: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  username: null,

  signIn: (username) => set({ username }),
  signOut: () => set({ username: null }),
}));
