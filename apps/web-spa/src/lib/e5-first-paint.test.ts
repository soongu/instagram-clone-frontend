// apps/web-spa/src/lib/e5-first-paint.test.ts
// E-5 Step 6 — 첫 화면이 그려지기 전에 표시를 붙였는가 (내부 검증용)
//
// 실제로 언제 그려지는지는 브라우저에서만 잴 수 있어 scratch 채증에 적어 뒀다.
// 여기서 지키는 것은 "그 몇 줄이 제자리에 있고, 저장소 이름이 두 곳에서 안 갈라졌는가" 다.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { THEME_STORAGE_KEY } from './theme';

// vitest 는 apps/web-spa 를 뿌리로 돌아간다
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

const headStart = html.indexOf('<head>');
const headEnd = html.indexOf('</head>');
const head = html.slice(headStart, headEnd);

describe('첫 그림 전에 표시를 붙이는 몇 줄', () => {
  it('머리쪽(head)에 있다 — 몸통이 그려지기 전에 실행돼야 한다', () => {
    expect(head).toContain('classList.add');
    expect(head).toContain('prefers-color-scheme: dark');
  });

  it('앱 스크립트보다 먼저 온다', () => {
    expect(headEnd).toBeLessThan(html.indexOf('src="/src/main.tsx"'));
  });

  it('기다리게 만드는 것이 붙어 있지 않다 — 늦으면 넣은 뜻이 없어진다', () => {
    const inlineScript = head.slice(head.indexOf('<script>'), head.indexOf('</script>'));

    expect(inlineScript).not.toContain('defer');
    expect(inlineScript).not.toContain('async');
    expect(inlineScript).not.toContain('type="module"');
  });

  it('저장소 이름이 lib/theme.ts 와 같다 — 이 둘이 갈라지면 조용히 안 걸린다', () => {
    // 따옴표까지 함께 본다. 이름만 찾으면 'ig-theme-어쩌고' 도 통과해 버린다.
    expect(head).toContain(`'${THEME_STORAGE_KEY}'`);
  });

  it('저장소를 못 읽는 곳에서도 화면은 떠야 한다', () => {
    expect(head).toContain('try');
    expect(head).toContain('catch');
  });
});
