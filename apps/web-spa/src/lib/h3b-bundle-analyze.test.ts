// apps/web-spa/src/lib/h3b-bundle-analyze.test.ts
//
// 번들을 들여다보는 도구가 「볼 때만」 끼워지는지를 지킨다.
//
// 이 배선은 화면에 아무 흔적을 안 남긴다. 그래서 눈으로는 살아 있는지 알 수 없고,
// 설정 파일을 직접 읽는 판이 유일한 방어선이다 (C-1·F-4·H-1 선례).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readRepoFile = (relative: string) =>
  readFileSync(resolve(import.meta.dirname, '../..', relative), 'utf8');

const viteConfig = readRepoFile('vite.config.ts');
const packageJson = JSON.parse(readRepoFile('package.json')) as {
  scripts: Record<string, string>;
  devDependencies: Record<string, string>;
};

describe('번들 그림 배선', () => {
  it('그림 도구를 가져다 쓴다', () => {
    expect(viteConfig).toContain("from 'rollup-plugin-visualizer'");
    expect(packageJson.devDependencies['rollup-plugin-visualizer']).toBeDefined();
  });

  it('평소 빌드에는 안 끼운다 — ANALYZE 가 있을 때만', () => {
    // 조건 없이 부르면 매 빌드마다 1 MB 가 넘는 HTML 이 생긴다.
    expect(viteConfig).toContain('process.env.ANALYZE');

    // visualizer( 호출이 ANALYZE 조건 뒤에 와야 한다.
    const gate = viteConfig.indexOf('process.env.ANALYZE');
    const call = viteConfig.indexOf('visualizer({');
    expect(gate).toBeGreaterThan(-1);
    expect(call).toBeGreaterThan(gate);
  });

  it('볼 일이 있을 때 부르는 이름이 있다', () => {
    expect(packageJson.scripts['build:analyze']).toBe('ANALYZE=1 npm run build');
  });

  it('그림은 저장소에 안 쌓인다', () => {
    // 빌드할 때마다 다시 만들어지는 1 MB 짜리라 커밋 대상이 아니다.
    const ignore = readRepoFile('../../.gitignore');
    expect(ignore).toContain('apps/web-spa/scratch/h3b-treemap.html');
  });

  it('H-2 가 정한 지도 설정을 안 건드린다', () => {
    // 'hidden' 이라 배포본이 지도를 안 가리킨다. 이 줄이 바뀌면
    // 소스가 배포본 옆에 공개될 수 있다 (H-2).
    expect(viteConfig).toContain("sourcemap: 'hidden'");
  });
});
