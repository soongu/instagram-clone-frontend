// 폴링이 얼마나 늦게 아는지를 진짜 서버로 잰다.
//
//   node apps/api-stub/server.mjs        (다른 터미널)
//   node apps/web-spa/scratch/c8-polling-measure.mjs
//
// 브라우저가 하는 일과 같다 — 정해둔 간격마다 GET /api/posts 를 부르고,
// 그동안 다른 사람이 좋아요를 누르면 언제 알아채는지 잰다.

const BASE = 'http://localhost:8090';
const INTERVAL_MS = Number(process.env.INTERVAL_MS ?? 3000);
const TRIALS = Number(process.env.TRIALS ?? 6);

const login = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'jaehoon' }),
}).then((r) => r.json());

let token = login.data.accessToken;
const refreshToken = login.data.refreshToken;

async function refreshIfNeeded(response) {
  if (response.status !== 401) return false;
  const renewed = await fetch(`${BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }).then((r) => r.json());
  token = renewed.data.accessToken;
  return true;
}

// 다른 사람이 누른 것처럼 좋아요를 바꾼다.
async function someoneElseLikes() {
  for (;;) {
    const res = await fetch(`${BASE}/api/posts/1/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (await refreshIfNeeded(res)) continue;
    const body = await res.json();
    if (body.success) return body.data.likeCount;
    // 스텁은 다섯 번에 한 번 실패한다. 다시 누른다.
  }
}

let requests = 0;
async function currentCount() {
  requests += 1;
  const body = await fetch(`${BASE}/api/posts`).then((r) => r.json());
  return body.data.find((post) => post.id === 1).likeCount;
}

const delays = [];
const startedAt = Date.now();

// ⚠️ 폴링은 우리가 언제 바꾸든 자기 시계대로 돈다.
// 바꾼 직후부터 세기 시작하면 늘 "간격 한 번" 이 나온다(그렇게 쟀다가 6회 전부
// 3403ms 가 나왔다 — 재는 방법이 답을 정해버린 것이다).
// 그러니 폴링은 끊지 말고 계속 돌리고, 바꾸는 시점을 주기 안에서 흩는다.
let latest = await currentCount();
const poller = setInterval(async () => {
  latest = await currentCount();
}, INTERVAL_MS);

for (let trial = 0; trial < TRIALS; trial += 1) {
  // 주기 안 아무 데서나 바뀌게 한다.
  await new Promise((r) => setTimeout(r, Math.random() * INTERVAL_MS));

  const before = latest;
  const changedTo = await someoneElseLikes();
  const changedAt = Date.now();

  // 돌고 있는 폴링이 언제 알아채나.
  while (latest === before) {
    await new Promise((r) => setTimeout(r, 20));
  }

  delays.push(Date.now() - changedAt);
  console.log(`  ${trial + 1}번째 — ${before} → ${changedTo}, 알아채기까지 ${delays.at(-1)}ms`);
}

clearInterval(poller);

const elapsed = Date.now() - startedAt;
const sorted = [...delays].sort((a, b) => a - b);
const average = Math.round(delays.reduce((sum, it) => sum + it, 0) / delays.length);

console.log(`\n간격 ${INTERVAL_MS}ms · ${TRIALS}회`);
console.log(`  가장 빨리 안 것: ${sorted[0]}ms`);
console.log(`  가장 늦게 안 것: ${sorted.at(-1)}ms`);
console.log(`  평균           : ${average}ms  (간격의 ${(average / INTERVAL_MS).toFixed(2)}배)`);
console.log(`  보낸 요청       : ${requests}번 / ${(elapsed / 1000).toFixed(1)}초`);
console.log(`  그중 달라진 답  : ${TRIALS}번`);
