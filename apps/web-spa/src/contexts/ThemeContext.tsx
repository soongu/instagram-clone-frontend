// apps/web-spa/src/contexts/ThemeContext.tsx
import { createContext, useContext, type ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';

// 훅이 무엇을 돌려주는지는 훅이 이미 알고 있다. 같은 모양을 손으로 또 적지 않는다.
type ThemeContextValue = ReturnType<typeof useTheme>;

// 통로를 하나 만든다. 값은 여기 없다 — 아래에서 Provider 가 넣어준다.
// 그럴듯한 기본값을 주면 감싸는 걸 잊어도 화면이 그려져서, 버튼이 안 먹는
// 이유를 한참 못 찾는다. 그래서 "아직 아무도 안 넣었다" 는 뜻으로 null 을 둔다.
const ThemeContext = createContext<ThemeContextValue | null>(null);

// 상태는 이 컴포넌트 한 곳에서만 생긴다.
// 아래 어디에서 몇 번을 꺼내 쓰든 useState 는 늘어나지 않는다.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();

  // React 19 부터는 Context 를 그대로 쓴다. `.Provider` 를 안 붙인다.
  return <ThemeContext value={theme}>{children}</ThemeContext>;
}

// 꺼내 쓰는 쪽은 Context 가 무엇인지 몰라도 된다. 이 훅만 부르면 된다.
// null 검사를 여기서 한 번만 하면, 쓰는 쪽 열 곳이 그 검사를 안 해도 된다.
// 그리고 이 if 를 통과한 아래에서 TypeScript 는 value 가 null 이 아님을 안다.
export function useThemeContext() {
  const value = useContext(ThemeContext);

  if (value === null) {
    throw new Error('useThemeContext 는 ThemeProvider 안에서 불러야 합니다');
  }

  return value;
}
