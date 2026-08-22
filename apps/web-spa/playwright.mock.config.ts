// apps/web-spa/playwright.mock.config.ts
//
// 같은 판을 연습용 서버 없이 돌린다. F-4 에서 만든 핸들러 목록을
// 서비스 워커가 그대로 쓴다 — 판이 쓰는 목록과 한 벌이다.
import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,

  // 연습용 서버(:8090)는 아예 안 띄운다. 개발 서버 하나뿐이다.
  //
  // 이미 떠 있는 것에 붙으면 안 된다 — 흉내 서버를 켠 것인지
  // 진짜에 붙은 것인지 알 수 없게 된다.
  webServer: {
    command: 'VITE_MOCK_API=1 npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: false,
  },
});
