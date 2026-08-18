// apps/web-next/app/components/Providers.tsx
'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type TextScaleValue = {
  large: boolean;
  toggle: () => void;
};

// 통로를 하나 만든다. C-3 에서 만든 ThemeContext 와 같은 모양이다.
const TextScaleContext = createContext<TextScaleValue>({
  large: false,
  toggle: () => {},
});

// 상태를 드는 곳이라 브라우저에서 돌아야 한다.
// 그런데 안에 그릴 것은 여기서 만들지 않는다 — children 으로 받아 그 자리에 놓기만 한다.
export function Providers({ children }: { children: ReactNode }) {
  const [large, setLarge] = useState(false);

  return (
    <TextScaleContext value={{ large, toggle: () => setLarge(!large) }}>
      <div className={large ? 'text-lg' : undefined}>{children}</div>
    </TextScaleContext>
  );
}

// 꺼내 쓰는 쪽은 Context 가 무엇인지 몰라도 된다. 이 훅만 부르면 된다.
export function useTextScale() {
  return useContext(TextScaleContext);
}
