// apps/web-spa/vite.config.ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  build: {
    // 배포본은 이름이 뭉개진다. 지도를 함께 만들어야 원래 줄로 되돌릴 수 있다.
    // 기본값이 false 라, 켜기 전에는 .map 파일이 하나도 안 나온다.
    sourcemap: true,
  },
  // '@/' 로 src 아래를 가리킨다 — 가져다 쓸 컴포넌트가 이 이름으로 서로를 부른다
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    // React Compiler — 빌드할 때 자동으로 메모이제이션을 넣어준다
    await babel({
      presets: [reactCompilerPreset()],
    }),
    // 빌드 산출물에 이름표(Debug ID)를 박는다.
    sentryVitePlugin({ telemetry: false }),
  ],
});
