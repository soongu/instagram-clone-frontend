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
    },
  }),
);
