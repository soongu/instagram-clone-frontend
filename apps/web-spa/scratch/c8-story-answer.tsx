// C-8 과제 예시답안 (내부 검증용)
import { useEffect, useState } from 'react';
import { useConnectionStore } from '../src/stores/useConnectionStore';

// 과제 2 — 끊긴 지 10초가 지나면 눈에 띄게 알린다.
//
// 표시가 빨간 점으로 바뀌는 것은 즉시지만, 안내는 잠깐 기다렸다 띄운다.
// 잠깐 끊겼다 바로 붙는 일은 흔하고, 그때마다 큰 안내가 뜨면 더 시끄럽다.
export function OfflineNotice({ afterMs = 10_000 }: { afterMs?: number }) {
  const status = useConnectionStore((state) => state.status);
  const attempts = useConnectionStore((state) => state.attempts);
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    // 끊긴 상태가 아니면 셀 것이 없다.
    if (status !== 'offline') return;

    const timer = setTimeout(() => setWaited(true), afterMs);

    // 다시 붙거나 화면에서 사라지면 예약해둔 것을 취소하고 처음으로 돌린다.
    return () => {
      clearTimeout(timer);
      setWaited(false);
    };
  }, [status, afterMs]);

  // ⚠️ 안내를 띄울지는 state 로 따로 들고 있지 않는다.
  // "끊겼고" + "기다릴 만큼 기다렸다" 두 가지에서 그때그때 계산한다.
  // 따로 들고 있으면 다시 붙었을 때 그것도 꺼주는 코드를 또 써야 한다.
  const showNotice = status === 'offline' && waited;

  if (!showNotice) return null;

  return (
    <p role="alert" className="rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-600">
      연결이 끊겨 새 소식을 못 받고 있어요. 다시 연결하는 중입니다
      {attempts > 0 ? ` (${attempts}번째 시도)` : ''}.
    </p>
  );
}
