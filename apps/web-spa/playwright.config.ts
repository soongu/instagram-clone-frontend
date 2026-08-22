// apps/web-spa/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // 판을 어디서 찾을지 정한다. 이 폴더 밖은 안 본다.
  testDir: './e2e',

  // 판마다 주소를 통째로 적지 않도록 앞부분을 여기에 둔다.
  use: {
    baseURL: 'http://localhost:5173',
  },
});
