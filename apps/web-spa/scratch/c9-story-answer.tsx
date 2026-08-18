// C-9 과제 예시답안 (내부 검증용)
//
// 과제 1 — 안 읽은 쪽지 개수를 머리말에
// 과제 2 — 탭이 다시 앞으로 오면 즉시 다시 붙는다
import { useEffect } from 'react';
import { create } from 'zustand';
import type { Client } from '@stomp/stompjs';
import { parseDirectMessage } from '../src/lib/dmEvents';
import { useSessionStore } from '../src/stores/useSessionStore';
import { DM_QUEUE } from '../src/realtime/stompClient';

// ── 과제 1 ────────────────────────────────────────────────────────────────
//
// 세 갈래로 따지면: 서버가 세어주는 값이 아니고(서버는 우리가 읽었는지 모른다),
// 주소에 담을 것도 아니다(주소를 공유해도 남의 안 읽은 개수는 뜻이 없다).
// 머리말과 쪽지 화면 둘 다 알아야 하니 store 다.
interface UnreadState {
  count: number;
  add: () => void;
  clear: () => void;
}

export const useUnreadStore = create<UnreadState>()((set) => ({
  count: 0,
  add: () => set((current) => ({ count: current.count + 1 })),
  clear: () => set({ count: 0 }),
}));

// 통로가 쪽지를 받을 때 함께 부른다.
// ⚠️ 내가 보낸 것도 되돌아온다. 그것까지 세면 보낼 때마다 개수가 올라간다.
export function countIfFromOther(senderUsername: string, me: string | null): boolean {
  return me !== null && senderUsername !== me;
}

export function UnreadBadge() {
  const count = useUnreadStore((state) => state.count);
  if (count === 0) return null;

  return <span data-slot="unread-badge">{count}</span>;
}

// 쪽지 화면에 들어가면 0 으로 되돌린다.
export function useClearUnreadOnEnter() {
  const clear = useUnreadStore((state) => state.clear);
  useEffect(() => clear(), [clear]);
}

// 통로 쪽에 얹는 구독 한 줄. 실제로는 RealtimeBridge 의 onConnect 안에 들어간다.
export function subscribeUnread(client: Client) {
  return client.subscribe(DM_QUEUE, (message) => {
    const received = parseDirectMessage(message.body);
    if (received === null) return;

    const me = useSessionStore.getState().username;
    if (countIfFromOther(received.senderUsername, me)) {
      useUnreadStore.getState().add();
    }
  });
}

// ── 과제 2 ────────────────────────────────────────────────────────────────
//
// 백오프가 길어지는 구간은 대개 아무도 안 보고 있을 때다. 보러 온 순간에는
// 기다리던 것을 취소하고 즉시 한 번 시도한다.
//
// deactivate() 가 예약된 재시도 타이머를 지운다. 그래서 곧바로 activate() 하면
// 남은 대기 시간을 건너뛰고, 다음 실패부터는 지연이 처음 값에서 다시 커진다.
export async function retryNow(client: Client): Promise<void> {
  // ⚠️ 멀쩡히 붙어 있으면 아무것도 하지 않는다. 끊었다 붙이면 손해만 본다.
  if (client.connected) return;

  await client.deactivate();
  client.activate();
}

export function useRetryOnVisible(client: Client) {
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== 'visible') return;
      void retryNow(client);
    }

    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [client]);
}
