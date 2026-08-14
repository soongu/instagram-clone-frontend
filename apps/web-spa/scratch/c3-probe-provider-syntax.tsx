// C-3 사전 확인용 — 옛 .Provider 문법을 우리 린트가 잡는가
import { createContext } from 'react';

const ProbeContext = createContext<string | null>(null);

// 옛 방식
export function OldProvider({ children }: { children: React.ReactNode }) {
  return <ProbeContext.Provider value="dark">{children}</ProbeContext.Provider>;
}

// React 19 방식
export function NewProvider({ children }: { children: React.ReactNode }) {
  return <ProbeContext value="dark">{children}</ProbeContext>;
}
