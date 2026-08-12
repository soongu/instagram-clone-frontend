// apps/web-spa/src/hooks/useTheme.ts
import { useEffect, useState } from 'react';
import {
  applyResolvedTheme,
  readStoredChoice,
  resolveTheme,
  storeChoice,
  type ThemeChoice,
} from '../lib/theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(() => readStoredChoice(window.localStorage));
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia(DARK_QUERY).matches,
  );

  // 운영체제 설정은 우리가 바꿀 수 없고 그쪽에서 바뀌었다고 알려준다.
  // '시스템' 을 고른 사람은 이 알림을 받아야 화면이 따라 움직인다.
  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches);

    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  const resolved = resolveTheme(choice, systemPrefersDark);

  // 색을 고르는 것은 CSS 가 하고, 여기서는 표시만 붙였다 뗀다.
  useEffect(() => {
    applyResolvedTheme(document.documentElement, resolved);
  }, [resolved]);

  function select(next: ThemeChoice) {
    setChoice(next);
    storeChoice(window.localStorage, next);
  }

  return { choice, resolved, select };
}
