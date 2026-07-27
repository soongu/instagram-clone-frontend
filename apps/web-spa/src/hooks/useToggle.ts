// apps/web-spa/src/hooks/useToggle.ts
import { useState } from 'react';

// 켜고 끄는 값 하나와 뒤집는 함수 하나.
// useState 처럼 배열로 돌려주면 쓰는 쪽이 이름을 마음대로 붙일 수 있다.
// 돌려주는 모양을 적어두지 않으면 두 값이 하나로 뭉뚱그려져 toggle() 을 부를 수 없다.
export function useToggle(initialOn = false): [boolean, () => void] {
  const [on, setOn] = useState(initialOn);

  function toggle() {
    setOn(!on);
  }

  return [on, toggle];
}
