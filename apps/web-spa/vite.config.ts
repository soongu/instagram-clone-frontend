// apps/web-spa/vite.config.ts
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // React Compiler — 빌드할 때 자동으로 메모이제이션을 넣어준다
    await babel({
      presets: [reactCompilerPreset()],
    }),
  ],
});
