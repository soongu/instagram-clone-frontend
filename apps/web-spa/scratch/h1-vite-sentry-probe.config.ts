// 계획 단계 탐침 — authToken 없이 Debug ID 가 주입되는가 (본 vite.config.ts 는 안 건드린다)
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
  },
  build: {
    outDir: 'dist-h1-probe',
    sourcemap: true, // 이게 없으면 애초에 .map 이 안 나온다
  },
  plugins: [
    react(),
    tailwindcss(),
    await babel({ presets: [reactCompilerPreset()] }),
    // authToken·org·project 를 하나도 안 준다 — 업로드는 못 하겠지만 주입은?
    sentryVitePlugin({ telemetry: false }),
  ],
});
