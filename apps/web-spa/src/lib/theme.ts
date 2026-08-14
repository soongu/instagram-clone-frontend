// apps/web-spa/src/lib/theme.ts

/** 사용자가 고를 수 있는 것은 셋이다. '시스템' 은 "내가 안 고르겠다" 는 선택이다. */
export type ThemeChoice = 'light' | 'dark' | 'system';

/** 실제로 화면에 그릴 것은 둘뿐이다. */
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'ig-theme';

/**
 * 휴대폰 브라우저가 주소창을 칠할 색. `--color-canvas` 와 같은 값이어야 한다.
 * 주소창은 CSS 가 닿지 않는 곳이라 값을 여기 한 번 더 적는다 —
 * 토큰을 바꾸면 이쪽도 함께 바꿔야 한다(index.html 의 첫 표시 붙이기와 같은 사정).
 */
export const THEME_COLOR: Record<ResolvedTheme, string> = {
  light: '#fafafa',
  dark: '#000000',
};

const CHOICES: readonly ThemeChoice[] = ['light', 'dark', 'system'];

/** 저장소에서 온 값은 사용자가 손으로 고쳐 넣을 수 있으니 좁히고 나서 쓴다. */
export function isThemeChoice(value: unknown): value is ThemeChoice {
  return typeof value === 'string' && CHOICES.includes(value as ThemeChoice);
}

/** 고른 것 + 운영체제 설정 → 실제로 그릴 화면. */
export function resolveTheme(choice: ThemeChoice, systemPrefersDark: boolean): ResolvedTheme {
  if (choice === 'system') {
    return systemPrefersDark ? 'dark' : 'light';
  }
  return choice;
}

/**
 * 저장된 선택을 읽는다. 없거나 못 읽거나 모르는 값이면 '시스템' 으로 돌아온다.
 * 사파리 시크릿 모드처럼 localStorage 접근 자체가 막히는 곳이 있어서 감싸 둔다.
 */
export function readStoredChoice(storage: Pick<Storage, 'getItem'>): ThemeChoice {
  try {
    const stored = storage.getItem(THEME_STORAGE_KEY);
    return isThemeChoice(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

/** 고른 것을 저장한다. 저장이 막혀 있어도 화면은 그대로 굴러가야 한다. */
export function storeChoice(storage: Pick<Storage, 'setItem'>, choice: ThemeChoice): void {
  try {
    storage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // 저장만 못 할 뿐이라 이번 방문에는 선택이 그대로 살아 있다
  }
}

/** 표시를 붙이거나 뗀다. 색을 정하는 것은 CSS 쪽이고 여기는 표시만 만진다. */
export function applyResolvedTheme(root: Element, resolved: ResolvedTheme): void {
  root.classList.toggle('dark', resolved === 'dark');
}
