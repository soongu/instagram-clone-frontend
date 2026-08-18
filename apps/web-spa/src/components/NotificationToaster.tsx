// apps/web-spa/src/components/NotificationToaster.tsx
import { useEffect } from 'react';
import { useNotificationStore } from '../stores/useNotificationStore';
import { Toast } from './Toast';

// 알림이 화면에 머무는 시간. 읽고 넘길 만큼은 되고, 길지 않게.
const DURATION = 4000;

// 통로가 알림을 store 에 넣으면 여기서 띄운다.
// 앱에 한 번만 그려두면 어느 화면에 있든 뜬다 — 확인 상자와 같은 자리다.
export function NotificationToaster() {
  const current = useNotificationStore((state) => state.current);
  const dismiss = useNotificationStore((state) => state.dismiss);

  // 띄웠으면 치우는 것까지가 한 일이다 (B-4 에서 세운 규칙).
  useEffect(() => {
    if (current === null) return;

    const timerId = setTimeout(dismiss, DURATION);

    return () => clearTimeout(timerId);
  }, [current, dismiss]);

  if (current === null) return null;

  // 토스트는 이미 만들어둔 것을 그대로 쓴다. "방금 일어난 일" 을 알리는
  // 자리라서 role="status" 가 붙어 있는데, 알림이 바로 그것이다.
  return <Toast message={current.message} />;
}
