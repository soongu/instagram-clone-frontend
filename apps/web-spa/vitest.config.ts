// apps/web-spa/vitest.config.ts
// 상호작용(클릭·입력)을 검증하려면 브라우저 DOM 이 필요해서 jsdom 환경을 얹는다.
// vite.config.ts 는 그대로 두고 여기서 병합만 한다.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import viteConfig from './vite.config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        // scratch/ 는 앱이 아니라 보관해 둔 예전 판과 과제 답안이다.
        // 세는 대상에 두면 앱의 숫자를 가린다 — 148개 중 45개가 여기였다.
        exclude: ['scratch/**'],
      },
      // 판이 도는 곳이 두 군데가 됐다.
      // unit 은 jsdom 에서 흉내 낸 DOM 으로, storybook 은 진짜 브라우저로 돈다.
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            environment: 'jsdom',
            globals: true,
            setupFiles: ['./src/test-setup.ts'],
            // e2e/ 는 Playwright 가 돌린다. 그런데 파일 이름이 .spec.ts 라
            // Vitest 기본 include(**/*.{test,spec}.…)에도 걸린다.
            //
            // 빼두지 않으면 Vitest 가 남의 파일을 열고, 그때 나오는 오류는
            // "@playwright/test 가 두 벌 깔렸다" 고 엉뚱한 원인을 댄다.
            // 깔린 것은 한 벌이고, 진짜 문제는 러너가 바뀐 것이다.
            exclude: [...configDefaults.exclude, 'e2e/**'],
          },
        },
        {
          extends: true,
          // 이 플러그인이 .storybook 설정을 읽어 거기 등록된 스토리를 전부 판으로 만든다.
          // 우리가 판을 따로 쓰는 게 아니라 이미 써둔 이야기가 판이 되는 것이다.
          plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
          test: {
            name: 'storybook',
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({}),
              instances: [{ browser: 'chromium' }],
            },
          },
        },
      ],
    },
  }),
);
