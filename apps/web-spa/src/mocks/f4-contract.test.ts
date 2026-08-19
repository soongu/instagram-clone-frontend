// apps/web-spa/src/mocks/f4-contract.test.ts
// F-4 Step 7 — 핸들러는 사실이 아니라 우리가 적어둔 주장이다.
// 주장이 진짜 서버와 어긋나면 판은 초록인데 앱은 깨진다.
// 그래서 어긋남을 드러내는 판을 따로 둔다.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { handlers } from './handlers';

// 연습용 서버가 실제로 받아주는 주소 목록을, 손으로 옮겨 적지 않고
// 그 파일에서 그대로 읽어온다. 옮겨 적으면 그 목록이 또 하나의 주장이 된다.
const serverSource = readFileSync(resolve(process.cwd(), '../api-stub/server.mjs'), 'utf-8');

interface RealRoute {
  method: string;
  accepts: (path: string) => boolean;
}

/** server.mjs 의 라우트 블록에서 method 와 match 를 짝지어 읽는다 */
function readRealRoutes(): RealRoute[] {
  const blocks = [...serverSource.matchAll(/method: '(\w+)',\s*\n\s*match: \(path\) => (.+),\n/g)];

  return blocks.map(([, method, expression]) => {
    const literal = /^path === '(.+)'$/.exec(expression);
    if (literal !== null) {
      return { method, accepts: (path: string) => path === literal[1] };
    }

    const asRegExp = /^\/(.+)\/\.test\(path\)$/.exec(expression);
    if (asRegExp !== null) {
      const pattern = new RegExp(asRegExp[1]);
      return { method, accepts: (path: string) => pattern.test(path) };
    }

    throw new Error(`읽을 수 없는 라우트 표현: ${expression}`);
  });
}

const realRoutes = readRealRoutes();

/** 우리 핸들러 주소에서 :이름 자리를 실제 값처럼 채워 넣은 주소를 만든다 */
function sampleUrlOf(handlerPath: string): string {
  return new URL(handlerPath.replace(/:\w+/g, '1')).pathname;
}

describe('우리가 적어둔 주장이 진짜 서버와 어긋나지 않는다', () => {
  it('연습용 서버에서 라우트를 읽어냈다', () => {
    expect(realRoutes.length).toBe(15);
  });

  it.each(
    handlers.map((handler) => ({
      method: String(handler.info.method),
      path: String(handler.info.path),
    })),
  )('$method $path — 연습용 서버에도 있는 주소다', ({ method, path }) => {
    const pathname = sampleUrlOf(path);
    const found = realRoutes.some(
      (route) => route.method === method.toUpperCase() && route.accepts(pathname),
    );

    expect(found).toBe(true);
  });
});
