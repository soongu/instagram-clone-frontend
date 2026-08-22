// 배포본에서 「한 줄도 안 돈 코드」를 찾아 원본 파일 이름으로 되돌린다.
//
//   node scratch/h3c-coverage.mjs
//
// 의존성 0 — 크롬을 헤드리스로 띄우고 CDP 로 커버리지를 받은 뒤,
// dist 옆에 있는 소스맵으로 원본 파일 이름을 되찾는다.
//
// 미리 띄워둘 것: api-stub(:8090) · vite preview(:4173)

import { SourceMap } from 'node:module';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = '/Applications/Google Chrome 2.app/Contents/MacOS/Google Chrome';
const PAGE_URL = 'http://localhost:4173/';
const DIST = new URL('../dist/', import.meta.url);
const PORT = 9222;

// ── 크롬을 띄우고 CDP 소켓을 연다 ────────────────────────────────
async function openBrowser() {
  const chrome = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--user-data-dir=/tmp/h3c-coverage-profile',
    'about:blank',
  ], { stdio: 'ignore' });

  let target;
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const pages = (await res.json()).filter((t) => t.type === 'page');
      if (pages.length) { target = pages[0]; break; }
    } catch { /* 아직 안 떴다 */ }
  }
  if (!target) throw new Error('크롬이 안 떴습니다.');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((ok, fail) => { ws.onopen = ok; ws.onerror = fail; });

  let id = 0;
  const waiting = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && waiting.has(msg.id)) {
      const { ok, fail } = waiting.get(msg.id);
      waiting.delete(msg.id);
      if (msg.error) fail(new Error(msg.error.message));
      else ok(msg.result);
    }
  };
  const send = (method, params = {}) =>
    new Promise((ok, fail) => {
      const n = ++id;
      waiting.set(n, { ok, fail });
      ws.send(JSON.stringify({ id: n, method, params }));
    });

  return { send, close: () => { ws.close(); chrome.kill(); } };
}

// ── V8 구간은 중첩된다 — 가장 안쪽이 이긴다 ──────────────────────
// 스크립트 전체를 감싸는 바깥 구간은 count>0 이라, 그것만 보면
// 안 돈 함수까지 「실행됨」으로 세어 100% 가 나온다.
function unusedSpans(functions, length) {
  const covered = new Uint8Array(length); // 1 = 실행됨
  const ranges = functions.flatMap((f) => f.ranges);
  // 넓은 것부터 칠하면 좁은 것(안쪽)이 나중에 덮어써서 이긴다.
  ranges.sort((a, b) => (b.endOffset - b.startOffset) - (a.endOffset - a.startOffset));
  for (const r of ranges) {
    const value = r.count > 0 ? 1 : 0;
    covered.fill(value, r.startOffset, Math.min(r.endOffset, length));
  }

  const spans = [];
  let start = -1;
  for (let i = 0; i < length; i++) {
    if (covered[i] === 0 && start === -1) start = i;
    else if (covered[i] === 1 && start !== -1) { spans.push([start, i]); start = -1; }
  }
  if (start !== -1) spans.push([start, length]);
  return spans;
}

// 문자 offset → (줄, 칸). 번들은 거의 한 줄이라 칸 번호가 아주 크다.
function offsetToPosition(text) {
  const lineStarts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') lineStarts.push(i + 1);
  return (offset) => {
    let lo = 0, hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= offset) lo = mid; else hi = mid - 1;
    }
    return { line: lo, column: offset - lineStarts[lo] };
  };
}

function shorten(source) {
  const clean = source.replace(/^.*?\/(node_modules|src)\//, '$1/');
  const pkg = clean.match(/^node_modules\/((?:@[^/]+\/)?[^/]+)\//);
  return pkg ? pkg[1] : clean;
}

// ── 본체 ────────────────────────────────────────────────────────
const browser = await openBrowser();
try {
  await browser.send('Profiler.enable');
  await browser.send('Runtime.enable');
  await browser.send('Page.enable');
  await browser.send('Profiler.startPreciseCoverage', { callCount: false, detailed: true });

  await browser.send('Page.navigate', { url: PAGE_URL });

  // 피드 사진이 다 뜰 때까지 기다린다. 「안 왔는데 다 됐다」로 재지 않으려고
  // 장수를 함께 찍는다 (H-3 의 「CLS 0 두 가지 뜻」과 같은 이유).
  let images = { total: 0, loaded: 0 };
  for (let i = 0; i < 60; i++) {
    await sleep(500);
    const { result } = await browser.send('Runtime.evaluate', {
      expression: `(() => {
        const imgs = [...document.querySelectorAll('img[alt$="의 게시물"]')];
        return JSON.stringify({
          total: imgs.length,
          loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length,
        });
      })()`,
      returnByValue: true,
    });
    images = JSON.parse(result.value);
    if (images.total > 0 && images.loaded === images.total) break;
  }
  console.log(`사진 ${images.loaded}/${images.total}`);
  if (images.total === 0 || images.loaded !== images.total) {
    console.log('⚠️ 사진이 다 안 왔습니다. api-stub 이 떠 있는지 확인하세요.');
  }

  const { result: scripts } = await browser.send('Profiler.takePreciseCoverage');

  const perSource = new Map();
  const perSourceAll = new Map();
  let total = 0, unusedTotal = 0, unmapped = 0;

  for (const script of scripts) {
    const name = script.url.split('/').pop();
    if (!name || !name.endsWith('.js')) continue;

    let text, map;
    try {
      text = await readFile(new URL(`assets/${name}`, DIST), 'utf8');
      map = new SourceMap(JSON.parse(await readFile(new URL(`assets/${name}.map`, DIST), 'utf8')));
    } catch { continue; } // 우리 dist 파일이 아니다
    const at = offsetToPosition(text);

    total += text.length;

    // ⚠️ 안 쓴 구간 하나가 원본 파일 하나에서 왔다고 보면 안 된다.
    // 한 구간이 여러 모듈에 걸쳐 있어서, 시작점만 찍어 이름을 붙이면
    // 그 구간 전체가 엉뚱한 파일 하나의 몫으로 쌓인다.
    // 구간 안에서 소스맵 항목이 바뀌는 자리마다 잘라서 나눠 준다.
    const entryAt = (offset) => {
      const { line, column } = at(offset);
      return map.findEntry(line, column);
    };
    const sameEntry = (a, b) =>
      a?.generatedLine === b?.generatedLine && a?.generatedColumn === b?.generatedColumn;

    // 대조용 — 안 쓴 것 말고 「전부」를 같은 방법으로 나눠 본다.
    // 이 표의 비율이 트리맵과 맞으면 나누는 방법이 옳다는 뜻이다.
    {
      let pos = 0;
      while (pos < text.length) {
        const entry = entryAt(pos);
        let lo = pos + 1, hi = text.length;
        while (lo < hi) {
          const mid = (lo + hi + 1) >> 1;
          if (sameEntry(entryAt(mid), entry)) lo = mid; else hi = mid - 1;
        }
        if (entry?.originalSource) {
          const key = shorten(entry.originalSource);
          perSourceAll.set(key, (perSourceAll.get(key) ?? 0) + (lo - pos));
        }
        pos = lo;
      }
    }

    for (const [from, to] of unusedSpans(script.functions, text.length)) {
      unusedTotal += to - from;
      let pos = from;
      while (pos < to) {
        const entry = entryAt(pos);
        // 같은 항목이 이어지는 마지막 자리를 이진 탐색으로 찾는다.
        let lo = pos + 1, hi = to;
        while (lo < hi) {
          const mid = (lo + hi + 1) >> 1;
          if (sameEntry(entryAt(mid), entry)) lo = mid; else hi = mid - 1;
        }
        const bytes = lo - pos;
        if (entry?.originalSource) {
          const key = shorten(entry.originalSource);
          perSource.set(key, (perSource.get(key) ?? 0) + bytes);
        } else {
          unmapped += bytes;
        }
        pos = lo;
      }
    }
  }

  const used = total - unusedTotal;
  console.log(`\n  전체   ${total.toLocaleString()} B`);
  console.log(`  실행됨 ${used.toLocaleString()} B (${(used / total * 100).toFixed(1)}%)`);
  console.log(`  안 씀  ${unusedTotal.toLocaleString()} B (${(unusedTotal / total * 100).toFixed(1)}%)`);
  console.log(`         └ 이름을 되찾은 것 ${(unusedTotal - unmapped).toLocaleString()} B / 못 되찾은 것 ${unmapped.toLocaleString()} B\n`);

  console.log('  안 쓴 것의 정체:');
  for (const [source, bytes] of [...perSource].sort((a, b) => b[1] - a[1])) {
    if (bytes < 1000) continue;
    const ours = source.startsWith('src/') ? '  ← 우리 코드' : '';
    console.log(`    ${String(bytes).padStart(7)} B  ${source}${ours}`);
  }

  const ourUnused = [...perSource]
    .filter(([source]) => source.startsWith('src/'))
    .reduce((sum, [, bytes]) => sum + bytes, 0);
  console.log(`\n  └ 그중 우리 코드 ${ourUnused.toLocaleString()} B`);

  // 대조표 — 같은 방법으로 「전부」를 나눈 비율. 트리맵과 맞아야 한다.
  const allTotal = [...perSourceAll.values()].reduce((a, b) => a + b, 0);
  const byPackage = new Map();
  for (const [source, bytes] of perSourceAll) {
    const key = source.startsWith('src/') ? '우리 코드' : source;
    byPackage.set(key, (byPackage.get(key) ?? 0) + bytes);
  }
  console.log(`\n  [대조] 전부를 같은 방법으로 나눈 비율 (합계 ${allTotal.toLocaleString()} B):`);
  for (const [pkg, bytes] of [...byPackage].sort((a, b) => b[1] - a[1]).slice(0, 8)) {
    console.log(`    ${(bytes / allTotal * 100).toFixed(1).padStart(5)}%  ${String(bytes).padStart(7)} B  ${pkg}`);
  }
  const sentry = [...byPackage].filter(([k]) => k.startsWith('@sentry/'))
    .reduce((a, [, b]) => a + b, 0);
  console.log(`    (@sentry/* 합계 ${sentry.toLocaleString()} B = ${(sentry / allTotal * 100).toFixed(1)}%)`);
} finally {
  browser.close();
}
