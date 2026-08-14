// apps/web-spa/src/components/ThemeColorMeta.tsx
import { useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { THEME_COLOR } from '../lib/theme';

// 휴대폰 브라우저는 주소창을 이 값으로 칠한다.
// 화면은 어두운데 주소창만 하얗게 남으면 그 경계가 그대로 보인다.
// 주소창은 React 가 그리는 화면 밖이라 CSS 로는 못 닿는다 — 직접 맞춰줘야 한다.
export function ThemeColorMeta() {
  const { resolved } = useTheme();

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');

    if (meta !== null) {
      meta.setAttribute('content', THEME_COLOR[resolved]);
    }
  }, [resolved]);

  // 그리는 것이 없다. 화면 밖을 맞추는 일만 한다.
  return null;
}
