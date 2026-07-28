// apps/web-spa/src/components/EffectTimingDemo.tsx
import { useEffect, useState } from 'react';

// 같은 일을 하는 effect 셋을 나란히 두고, 의존성 배열만 다르게 적었다.
// 버튼을 눌러가며 콘솔을 보면 셋이 각각 언제 다시 도는지 갈린다.
export function EffectTimingDemo() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);

  // ① 배열을 아예 안 적으면 — 렌더가 끝날 때마다 매번
  useEffect(() => {
    console.log('① 배열 없음 · count =', count);
  });

  // ② 빈 배열이면 — 화면에 처음 붙을 때 한 번
  useEffect(() => {
    console.log('② 빈 배열 · 처음 한 번');
  }, []);

  // ③ [count] 면 — count 가 지난번과 달라졌을 때만
  useEffect(() => {
    console.log('③ [count] · count =', count);
  }, [count]);

  return (
    <div className="effect-demo">
      <p className="effect-demo-values">
        count: {count} / other: {other}
      </p>
      <button className="effect-demo-button" onClick={() => setCount(count + 1)}>
        count +1
      </button>
      <button className="effect-demo-button" onClick={() => setOther(other + 1)}>
        other +1
      </button>
    </div>
  );
}
