// apps/web-spa/src/components/RefVsStateDemo.tsx
import { useRef, useState } from 'react';
import { Button } from './Button';

// 값을 담아두는 두 가지 방법을 나란히 놓고 눌러보는 화면이다.
// 둘 다 렌더를 넘어 값이 남지만, 화면을 다시 그리게 하는 쪽은 하나뿐이다.
export function RefVsStateDemo() {
  const [stateCount, setStateCount] = useState(0);
  const refCount = useRef(0);

  return (
    <section className="ref-demo" aria-label="ref 와 state 비교">
      <p>state 로 센 수: {stateCount}</p>
      <p>ref 로 센 수: {refCount.current}</p>
      <Button onClick={() => setStateCount(stateCount + 1)}>state +1</Button>
      <Button
        onClick={() => {
          refCount.current += 1;
        }}
      >
        ref +1
      </Button>
    </section>
  );
}
