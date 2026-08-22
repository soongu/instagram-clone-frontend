// apps/web-spa/vite.config.ts
import { fileURLToPath } from 'node:url';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { defineConfig, type Plugin } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { visualizer } from 'rollup-plugin-visualizer';

// 첫 화면에서 받는 자바스크립트의 gzip 상한.
// 오늘 값(219,470 B)에 5,530 B 여유를 뒀다. 딱 맞추면 한 줄만 더해도 빨개지고,
// 너무 넉넉하면 넘은 줄 모르고 지나간다.
const ENTRY_GZIP_BUDGET = 225_000;

// chunkSizeWarningLimit 은 경고만 내고 빌드를 성공시킨다.
// 이 플러그인은 넘으면 실제로 빌드를 세운다 — 그래야 아무도 못 지나친다.
//
// closeBundle 은 파일을 다 쓴 뒤에 돈다. 그래서 막아도 dist/ 는 이미 만들어져 있다.
// 우리가 세우는 것은 파일 생성이 아니라 그 뒤로 이어지는 일(배포)이다.
function bundleBudget(budgetBytes: number): Plugin {
  return {
    name: 'bundle-budget',
    apply: 'build',
    closeBundle() {
      const dir = fileURLToPath(new URL('./dist/assets', import.meta.url));
      const entry = readdirSync(dir).find((file) => /^index-.*\.js$/.test(file));
      if (!entry) throw new Error('첫 화면 자바스크립트를 못 찾았습니다.');

      const gzipBytes = gzipSync(readFileSync(join(dir, entry))).length;
      const line = `${entry} gzip ${gzipBytes.toLocaleString()} B / 예산 ${budgetBytes.toLocaleString()} B`;
      if (gzipBytes > budgetBytes) {
        const over = gzipBytes - budgetBytes;
        throw new Error(`번들 예산 초과 — ${line} (${over.toLocaleString()} B 넘었습니다)`);
      }
      console.log(`[예산] ${line}`);
    },
  };
}

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
    //
    // 'hidden' 은 지도를 만들되 배포본이 그것을 가리키는 주석을 안 남긴다.
    // 지도에는 sourcesContent 로 원본이 통째로 들어 있어서,
    // 배포본 옆에 그대로 올리면 누구나 우리 소스를 내려받을 수 있다.
    sourcemap: 'hidden',
  },
  plugins: [
    bundleBudget(ENTRY_GZIP_BUDGET),
    react(),
    tailwindcss(),
    // React Compiler — 빌드할 때 자동으로 메모이제이션을 넣어준다
    await babel({
      presets: [reactCompilerPreset()],
    }),
    // 번들과 지도에 같은 이름표(Debug ID)를 붙여 짝을 맞춘다.
    // 파일 이름은 빌드할 때마다 바뀌지만 이 이름표는 둘을 확실히 이어준다.
    sentryVitePlugin({ telemetry: false }),
    // 번들 안에 무엇이 들어 있는지 그림으로 그려준다.
    //
    // 평소 빌드에는 안 끼운다 — 1 MB 가 넘는 HTML 을 매번 만들 이유가 없다.
    // 볼 일이 있을 때만 ANALYZE=1 을 붙여 부른다 (npm run build:analyze).
    //
    // 이 플러그인은 결과물을 재기만 하고 바꾸지 않는다.
    // 붙인 빌드와 안 붙인 빌드의 배포본 파일 이름(해시)이 같은지 대조해보면 확인된다.
    process.env.ANALYZE
      ? visualizer({
          filename: 'scratch/h3b-treemap.html',
          template: 'treemap',
          gzipSize: true,
          brotliSize: true,
        })
      : null,
  ],
});
