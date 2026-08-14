// apps/web-spa/src/AppProviders.tsx
import type { ReactNode } from 'react';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ThemeColorMeta } from './components/ThemeColorMeta';
import { ThemeProvider } from './contexts/ThemeContext';

// 라우터보다 바깥에 있어야 하는 것들을 한자리에 모은다.
//
// Layout 안에 뒀을 때는 오류 화면에서 통째로 사라졌다.
// 그 화면은 Layout 을 대체하기 때문이다 — 머리말도 토글도 없이 그려진다.
// 밝기는 어느 화면에서든 있어야 하니까 라우터 바깥으로 올린다.
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ThemeColorMeta />
      {children}
      {/* 확인 상자는 감쌀 것이 없다. 앱에 한 번 그려두기만 하면 된다. */}
      <ConfirmDialog />
    </ThemeProvider>
  );
}
