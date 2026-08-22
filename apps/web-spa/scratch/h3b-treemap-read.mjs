// 번들 그림(treemap)에 담긴 숫자를 표로 뽑아 읽는다. 의존성 0 — node 에 들어 있는 것만 쓴다.
//
//   npm run build:analyze
//   node scratch/h3b-treemap-read.mjs
//
// 그림은 마우스를 올려야 하나씩 보이지만, 여기서는 꾸러미별로 모아 한 번에 본다.
//
// ⚠️ 이 도구가 내는 숫자는 「압축 전」이다. 실제로 사용자에게 가는 크기는
//    빌드 출력에 찍히는 값이고, 여기서 참인 것은 「비율」이다.
//    맨 아래에서 둘을 나란히 찍어 얼마나 차이 나는지 직접 보여준다.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const TREEMAP = process.argv[2] ?? 'scratch/h3b-treemap.html';
const DIST = process.argv[3] ?? 'dist';

// ── 그림 파일에서 데이터 덩어리만 꺼낸다 ─────────────────────────────
const html = readFileSync(TREEMAP, 'utf8');
const start = html.indexOf('{', html.indexOf('const data = '));
if (start < 0) throw new Error(`${TREEMAP} 에서 데이터를 못 찾았다. build:analyze 를 먼저 돌렸는지 확인하자.`);

// 균형 잡힌 중괄호까지 잘라낸다 (문자열 안의 괄호는 세지 않는다)
let depth = 0;
let inString = false;
let escaped = false;
let end = start;
for (let i = start; i < html.length; i += 1) {
  const ch = html[i];
  if (escaped) { escaped = false; continue; }
  if (ch === '\\') { escaped = true; continue; }
  if (ch === '"') { inString = !inString; continue; }
  if (inString) continue;
  if (ch === '{') depth += 1;
  else if (ch === '}') { depth -= 1; if (depth === 0) { end = i + 1; break; } }
}
const data = JSON.parse(html.slice(start, end));

// ── 어느 모듈이 어느 청크에 들어갔는지 ──────────────────────────────
const chunkOf = new Map();
const walk = (node, chunk) => {
  if (node.children) {
    const next = node.name?.startsWith('assets/') ? node.name : chunk;
    for (const child of node.children) walk(child, next);
  } else if (node.uid) chunkOf.set(node.uid, chunk);
};
walk(data.tree, null);

// ── 꾸러미 이름으로 모은다 ─────────────────────────────────────────
const packageOf = (id) => {
  const m = id.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  if (m) return m[1];
  return '우리 코드';
};

const perChunk = new Map();
let renderedTotal = 0;
let gzipSumTotal = 0;
for (const [uid, part] of Object.entries(data.nodeParts)) {
  const meta = data.nodeMetas[part.metaUid];
  if (!meta) continue;
  const chunk = chunkOf.get(uid) ?? '(모름)';
  if (!perChunk.has(chunk)) perChunk.set(chunk, new Map());
  const bag = perChunk.get(chunk);
  const key = packageOf(meta.id);
  bag.set(key, (bag.get(key) ?? 0) + part.renderedLength);
  renderedTotal += part.renderedLength;
  gzipSumTotal += part.gzipLength ?? 0;
}

// ── 출력 ──────────────────────────────────────────────────────────
const fmt = (n) => n.toLocaleString('en-US');

for (const [chunk, bag] of [...perChunk].sort((a, b) =>
  [...b[1].values()].reduce((x, y) => x + y, 0) - [...a[1].values()].reduce((x, y) => x + y, 0))) {
  const total = [...bag.values()].reduce((a, b) => a + b, 0);
  console.log(`\n=== ${chunk} — 압축 전 ${fmt(total)} B ===`);
  for (const [name, bytes] of [...bag].sort((a, b) => b[1] - a[1])) {
    const pct = ((bytes * 100) / total).toFixed(1).padStart(5);
    const mark = name === '우리 코드' ? ' ←' : '';
    console.log(`  ${pct}%  ${fmt(bytes).padStart(10)} B  ${name}${mark}`);
  }
  const sentry = [...bag].filter(([n]) => n.startsWith('@sentry')).reduce((a, [, b]) => a + b, 0);
  if (sentry) console.log(`  (@sentry/* 합계 ${fmt(sentry)} B = ${((sentry * 100) / total).toFixed(1)}%)`);
}

// ── 그림의 숫자 vs 실제로 나가는 크기 ───────────────────────────────
const files = readdirSync(`${DIST}/assets`).filter((f) => f.endsWith('.js'));
const realBytes = files.reduce((a, f) => a + statSync(`${DIST}/assets/${f}`).size, 0);
const realGzip = files.reduce((a, f) => a + gzipSync(readFileSync(`${DIST}/assets/${f}`)).length, 0);

console.log('\n=== 그림의 숫자를 그대로 옮기면 안 되는 이유 ===');
console.log(`  그림의 모듈 합계 (압축 전) : ${fmt(renderedTotal)} B`);
console.log(`  실제 배포본 파일 합계       : ${fmt(realBytes)} B   → ${(renderedTotal / realBytes).toFixed(2)}배`);
console.log(`  그림의 모듈별 gzip 합계     : ${fmt(gzipSumTotal)} B`);
console.log(`  실제 배포본 gzip 합계       : ${fmt(realGzip)} B   → ${(gzipSumTotal / realGzip).toFixed(2)}배`);
console.log('  (모듈을 따로따로 압축하면 모듈 사이의 중복을 못 지운다)');
console.log(`\n  그림이 말하는 번들러 : rollup ${data.env?.rollup ?? '?'}`);
console.log('  실제 우리 번들러     : rolldown (package.json 의 vite 8 이 안에서 쓴다)');
