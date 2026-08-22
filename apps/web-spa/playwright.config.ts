// apps/web-spa/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // 판을 어디서 찾을지 정한다. 이 폴더 밖은 안 본다.
  testDir: './e2e',

  // 판마다 주소를 통째로 적지 않도록 앞부분을 여기에 둔다.
  use: {
    baseURL: 'http://localhost:5173',

    // 실패한 판만 기록을 남긴다. 통과한 판까지 남기면 금방 무거워진다.
    //
    // 남는 것은 화면 사진이 아니라 그 판이 지나온 전부다 —
    // 단계마다의 DOM, 오간 요청, 콘솔. 나중에 열어서 되감을 수 있다.
    trace: 'retain-on-failure',
  },

  // 판이 앱을 켠다. 손으로 두 개를 띄워두고 시작하지 않아도 된다.
  //
  // url 은 "여기가 200 을 주면 준비된 것" 이라는 신호다.
  // 그때까지 기다렸다가 판을 시작한다.
  //
  // reuseExistingServer 는 이미 떠 있으면 그걸 쓴다는 뜻이다.
  // 개발 중에는 편하지만 CI 에서는 꺼야 한다 — 남이 띄워둔 것에 붙으면
  // 무엇을 재고 있는지 알 수 없게 된다.
  webServer: [
    {
      command: 'node apps/api-stub/server.mjs',
      url: 'http://localhost:8090/api/posts',
      cwd: '../..',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
