// React 가 Performance 패널에 남기는 자국을 센다.
//
//   node scratch/h3c-react-tracks.mjs http://localhost:5173/   (개발 서버)
//   node scratch/h3c-react-tracks.mjs http://localhost:4173/   (배포본)
//
// 의존성 0 — 크롬을 헤드리스로 띄우고 performance.measure 항목을 읽는다.
// 미리 띄워둘 것: api-stub(:8090) + 재려는 서버
//
// ⚠️ 피드가 다 뜬 뒤에 세야 한다. 화면이 비어 있으면 React 가 그린 것이
//    없어서 0 이 나오는데, 그건 「자국이 없다」가 아니라 「그릴 게 없었다」다.

import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = '/Applications/Google Chrome 2.app/Contents/MacOS/Google Chrome';
const PAGE_URL = process.argv[2] ?? 'http://localhost:4173/';
const PORT = 9223;

const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--no-first-run',
  '--user-data-dir=/tmp/h3c-tracks-profile',
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
if (!target) { chrome.kill(); throw new Error('크롬이 안 떴습니다.'); }

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

const evaluate = async (expression) => {
  const { result } = await send('Runtime.evaluate', { expression, returnByValue: true });
  return result.value;
};

try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: PAGE_URL });

  let images = { total: 0, loaded: 0 };
  for (let i = 0; i < 60; i++) {
    await sleep(500);
    images = JSON.parse(await evaluate(`(() => {
      const imgs = [...document.querySelectorAll('img[alt$="의 게시물"]')];
      return JSON.stringify({
        total: imgs.length,
        loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length,
      });
    })()`));
    if (images.total > 0 && images.loaded === images.total) break;
  }

  // 하트를 한 번 눌러 갱신도 일으킨다 (처음 그리기 말고 다시 그리기 자국까지)
  await evaluate(`document.querySelector('button[aria-label="좋아요"]')?.click()`);
  await sleep(1000);

  const measures = JSON.parse(await evaluate(`(() => {
    const all = performance.getEntriesByType('measure');
    const byName = {};
    for (const m of all) {
      // React 는 이름 앞에 폭 없는 공백을 붙인다 — 눈에 안 보이니 지워서 센다
      const name = m.name.replace(/[\\u200b-\\u200d]/g, '').trim();
      byName[name] = (byName[name] ?? 0) + 1;
    }
    return JSON.stringify({ total: all.length, byName });
  })()`));

  console.log(`${PAGE_URL}`);
  console.log(`  사진 ${images.loaded}/${images.total}`);
  console.log(`  performance.measure 자국 ${measures.total}개`);
  const sorted = Object.entries(measures.byName).sort((a, b) => b[1] - a[1]);
  for (const [name, count] of sorted) {
    console.log(`    ${String(count).padStart(3)}회  ${name}`);
  }
} finally {
  ws.close();
  chrome.kill();
}
