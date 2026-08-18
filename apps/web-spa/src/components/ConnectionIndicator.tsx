// apps/web-spa/src/components/ConnectionIndicator.tsx
import { useConnectionStore } from '../stores/useConnectionStore';

const LABEL = {
  idle: '연결 전',
  connecting: '연결 중',
  connected: '실시간',
  offline: '연결 끊김',
} as const;

const DOT = {
  idle: 'bg-faint',
  connecting: 'bg-amber-500',
  connected: 'bg-emerald-500',
  offline: 'bg-rose-500',
} as const;

export function ConnectionIndicator() {
  // 필요한 한 조각만 고른다. status 가 안 바뀌면 이 컴포넌트는 안 다시 그려진다.
  const status = useConnectionStore((state) => state.status);

  // ⚠️ role="status" 를 붙이지 않는다. 그건 "방금 무슨 일이 있었는지" 를 알리는 자리이고,
  // 이미 토스트가 쓰고 있다. 늘 떠 있는 이 표시까지 같은 역할을 달면
  // 화면 읽어주는 프로그램이 둘 중 무엇을 읽어야 할지 알 수 없다.
  return (
    <span data-slot="connection-indicator" className="flex items-center gap-1.5 text-xs text-faint">
      <span aria-hidden="true" className={`size-2 rounded-full ${DOT[status]}`} />
      {LABEL[status]}
    </span>
  );
}
