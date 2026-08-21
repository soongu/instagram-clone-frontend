// apps/web-spa/vite.config.ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  // '@/' 로 src 아래를 가리킨다 — 가져다 쓸 컴포넌트가 이 이름으로 서로를 부른다
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // 배포본은 이름이 뭉개져 있어 그대로는 못 읽는다.
    // 뭉갠 것을 원래 줄로 되돌리는 지도를 함께 만들어 남긴다.
    sourcemap: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    // React Compiler — 빌드할 때 자동으로 메모이제이션을 넣어준다
    await babel({
      presets: [reactCompilerPreset()],
    }),
    // 번들과 지도에 같은 이름표(Debug ID)를 붙여 짝을 맞춘다.
    // 파일 이름은 빌드할 때마다 바뀌지만 이 이름표는 둘을 확실히 이어준다.
    sentryVitePlugin({ telemetry: false }),
  ],
});
