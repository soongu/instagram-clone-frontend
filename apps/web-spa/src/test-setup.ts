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

// jsdom 은 이미지를 실제로 내려받지 않는다. 그래서 "받아왔는지" 를 보고 갈리는
// 컴포넌트는 영영 사진을 안 그린다. 브라우저에서 사진이 뜬 뒤와 같게 답해 둔다.
if (typeof HTMLImageElement !== 'undefined') {
  Object.defineProperty(HTMLImageElement.prototype, 'complete', {
    configurable: true,
    get: () => true,
  });
  Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {
    configurable: true,
    get: () => 1,
  });
}

afterEach(() => {
  cleanup();
  // 테마는 <html> 에 표시를 남기므로 테스트끼리 새지 않게 지운다
  document.documentElement.classList.remove('dark');
  window.localStorage.clear();
});
