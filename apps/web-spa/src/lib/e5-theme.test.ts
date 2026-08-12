// apps/web-spa/src/lib/e5-theme.test.ts
// E-5 Step 5 — 셋 중에 고르는 표시 정하기 (내부 검증용)
import { describe, it, expect } from 'vitest';
import {
  THEME_STORAGE_KEY,
  isThemeChoice,
  readStoredChoice,
  resolveTheme,
  type ThemeChoice,
} from './theme';

describe('resolveTheme — 고른 것과 시스템 설정을 합쳐 실제로 그릴 화면을 정한다', () => {
  it('밝게를 골랐으면 시스템이 어두워도 밝게 그린다', () => {
    expect(resolveTheme('light', true)).toBe('light');
  });

  it('어둡게를 골랐으면 시스템이 밝아도 어둡게 그린다', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('시스템을 골랐을 때만 운영체제 설정을 따른다', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });
});

describe('isThemeChoice — 저장소에서 온 값은 믿지 않고 좁힌다', () => {
  it('세 가지 이름만 통과시킨다', () => {
    const valid: ThemeChoice[] = ['light', 'dark', 'system'];

    for (const choice of valid) {
      expect(isThemeChoice(choice)).toBe(true);
    }
  });

  it('그 밖의 값은 전부 막는다', () => {
    for (const value of ['Dark', 'blue', '', null, undefined, 0, {}]) {
      expect(isThemeChoice(value)).toBe(false);
    }
  });
});

describe('readStoredChoice — 저장된 게 없거나 이상하면 시스템으로 돌아온다', () => {
  const makeStorage = (value: string | null): Pick<Storage, 'getItem'> => ({
    getItem: (key) => (key === THEME_STORAGE_KEY ? value : null),
  });

  it('아무것도 저장 안 됐으면 시스템이다', () => {
    expect(readStoredChoice(makeStorage(null))).toBe('system');
  });

  it('저장된 값이 우리가 아는 이름이면 그대로 쓴다', () => {
    expect(readStoredChoice(makeStorage('dark'))).toBe('dark');
    expect(readStoredChoice(makeStorage('light'))).toBe('light');
  });

  it('손으로 고쳐 넣은 이상한 값은 시스템으로 떨어진다', () => {
    expect(readStoredChoice(makeStorage('보라색'))).toBe('system');
  });

  it('저장소를 아예 못 읽어도 화면은 떠야 한다', () => {
    const throwing: Pick<Storage, 'getItem'> = {
      getItem: () => {
        throw new Error('저장소를 쓸 수 없음');
      },
    };

    expect(readStoredChoice(throwing)).toBe('system');
  });
});
