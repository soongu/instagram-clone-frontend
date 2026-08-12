// apps/web-spa/src/test-setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom 에는 matchMedia 가 아예 없다. E-5 의 테마 선택이 시스템 설정을 읽으므로
// "시스템은 밝게" 로 답하는 최소한만 깔아 둔다.
// 시스템 설정이 바뀌는 상황은 그 테스트가 직접 자기 것으로 갈아 끼운다.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string) => ({
    media: query,
    matches: false,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

afterEach(() => {
  cleanup();
  // 테마는 <html> 에 표시를 남기므로 테스트끼리 새지 않게 지운다
  document.documentElement.classList.remove('dark');
  window.localStorage.clear();
});
