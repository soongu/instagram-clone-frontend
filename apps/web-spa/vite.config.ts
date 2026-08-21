// apps/web-spa/vite.config.ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // '@/' 로 src 아래를 가리킨다 — 가져다 쓸 컴포넌트가 이 이름으로 서로를 부른다
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // 배포본은 이름이 뭉개져 있어 그대로는 못 읽는다.
    // 뭉갠 것을 원래 줄로 되돌리는 지도를 함께 만들어둔다.
    sourcemap: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    // React Compiler — 빌드할 때 자동으로 메모이제이션을 넣어준다
    await babel({
      presets: [reactCompilerPreset()],
    }),
  ],
});
