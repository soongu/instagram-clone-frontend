// apps/web-next/app/components/Providers.tsx
'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, type ReactNode } from 'react';

type TextScaleValue = {
  toggle: () => void;
};

// 통로는 그대로 둔다. 다만 이 통로로 흐르는 것이 바뀌었다 —
// 값을 들고 있지 않고, 값을 바꾸는 방법만 내려보낸다.
const TextScaleContext = createContext<TextScaleValue>({
  toggle: () => {},
});

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  // 상태를 여기서 들지 않는다. 쿠키에 적고, 서버에게 다시 그려달라고 한다.
  function toggle() {
    const large = document.cookie.includes('text-scale=large');
    document.cookie = `text-scale=${large ? 'normal' : 'large'}; path=/; max-age=31536000`;
    router.refresh();
  }

  return <TextScaleContext value={{ toggle }}>{children}</TextScaleContext>;
}

export function useTextScale() {
  return useContext(TextScaleContext);
}
