// apps/web-spa/vitest.config.ts
// 상호작용(클릭·입력)을 검증하려면 브라우저 DOM 이 필요해서 jsdom 환경을 얹는다.
// vite.config.ts 는 그대로 두고 여기서 병합만 한다.
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test-setup.ts'],
      coverage: {
        // scratch/ 는 앱이 아니라 보관해 둔 예전 판과 과제 답안이다.
        // 세는 대상에 두면 앱의 숫자를 가린다 — 148개 중 45개가 여기였다.
        exclude: ['scratch/**'],
      },
    },
  }),
);
