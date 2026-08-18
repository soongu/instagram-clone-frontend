// apps/web-spa/src/stores/useNotificationStore.ts
import { create } from 'zustand';
import type { AppNotification } from '../types/notification';

// 지금 띄워둘 알림.
//
// 통로는 앱에 있고 알림 상자는 화면 어디에도 있을 수 있다. 둘을 잇는 자리가
// 필요한데 서버가 주인인 값도 아니고 주소에 담을 것도 아니다 — store 다.
// (확인 상자를 담아둔 곳과 같은 이유다.)
interface NotificationState {
  current: AppNotification | null;

  show: (notification: AppNotification) => void;
  dismiss: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  current: null,

  // 겹치면 나중 것이 이긴다. 알림 상자는 한 번에 하나만 띄운다.
  show: (notification) => set({ current: notification }),

  dismiss: () => set({ current: null }),
  reset: () => set({ current: null }),
}));
