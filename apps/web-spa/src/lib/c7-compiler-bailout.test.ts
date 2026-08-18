// apps/web-spa/src/lib/c7-compiler-bailout.test.ts
// C-7 Step 2·4 — 컴파일러가 무엇을 쓰고 무엇을 포기하는지 (내부 검증용)
//
// 빌드 결과물을 직접 뽑아서 본다. 화면 동작이 아니라 "만들어진 코드" 를 재는 판이다.
import { readFileSync } from 'node:fs';
import { transformAsync } from '@babel/core';
import { describe, it, expect } from 'vitest';

interface CompileEvent {
  kind: string;
  detail?: { options?: { category?: string; reason?: string } };
}

async function compile(file: string) {
  const events: CompileEvent[] = [];
  const out = await transformAsync(readFileSync(file, 'utf8'), {
    filename: file,
    plugins: [
      [
        'babel-plugin-react-compiler',
        { logger: { logEvent: (_f: unknown, e: CompileEvent) => events.push(e) } },
      ],
    ],
    parserOpts: { plugins: ['jsx', 'typescript'] },
    configFile: false,
    babelrc: false,
  });

  const code = out?.code ?? '';

  return {
    code,
    // _c(N) 가 하나도 없으면 그 파일은 통째로 건너뛴 것이다
    cacheSizes: [...code.matchAll(/_c\((\d+)\)/g)].map((m) => Number(m[1])),
    categories: events
      .filter((e) => e.kind === 'CompileError')
      .map((e) => e.detail?.options?.category),
  };
}

describe('C-7 — 컴파일러가 쓴 코드', () => {
  it('★ 캐시 배열을 만들고 값이 그대로면 지난번 것을 돌려준다', async () => {
    const { code, cacheSizes } = await compile('src/components/LikeButton.tsx');

    expect(code).toContain('react/compiler-runtime');
    expect(cacheSizes).toEqual([11]);
    // 비교해서 갈리는 모양 — 달라졌을 때만 다시 만든다
    expect(code).toMatch(/if \(\$\[\d+\] !== /);
    expect(code).toMatch(/\$\[\d+\] = /);
  });

  it('우리가 손으로 쓴 메모이제이션은 한 줄도 없다', () => {
    const source = readFileSync('src/components/LikeButton.tsx', 'utf8');

    expect(source).not.toContain('useMemo');
    expect(source).not.toContain('useCallback');
    expect(source).not.toContain('memo(');
  });
});

describe('C-7 — 컴파일러가 포기하는 자리', () => {
  it('★ 렌더가 끝난 뒤 변수를 고치는 파일은 통째로 건너뛴다', async () => {
    const { cacheSizes, categories } = await compile('src/components/ClickCounter.tsx');

    expect(cacheSizes).toEqual([]);
    // 이 이름이 곧 eslint 규칙 react-hooks/immutability 다
    expect(categories).toContain('Immutability');
  });

  it('★ 렌더 중에 ref 를 읽는 파일도 통째로 건너뛴다', async () => {
    const { cacheSizes, categories } = await compile('src/components/RefVsStateDemo.tsx');

    expect(cacheSizes).toEqual([]);
    // 이 이름이 곧 eslint 규칙 react-hooks/refs 다
    expect(categories).toContain('Refs');
  });

  it('규칙을 지킨 화면들은 전부 캐시를 받는다', async () => {
    const files = [
      'src/components/PostBody.tsx',
      'src/components/PostCard.tsx',
      'src/components/FeedSection.tsx',
      'src/routes/HomePage.tsx',
    ];

    for (const file of files) {
      const { cacheSizes } = await compile(file);

      expect(cacheSizes.length, `${file} 이 건너뛰어졌다`).toBeGreaterThan(0);
    }
  });
});
