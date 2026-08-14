// apps/api-stub/server.mjs
//
// 연습용 API 서버. Node 내장 http 만 쓰기 때문에 설치할 것이 없다.
//
//   node apps/api-stub/server.mjs
//
// 백엔드 과목을 병행하고 있다면 이 서버는 필요 없다. 그쪽 Spring Boot 를
// 8090 포트로 띄우면 아래와 똑같은 주소·똑같은 봉투로 응답한다.
//
// 봉투는 백엔드의 ApiResponse<T> 를 그대로 흉내 낸다.
//   성공: { success: true,  data: T,    message: null }
//   실패: { success: false, data: null, message: "사유" }

import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 8090);

// 지연 시간. 진짜 서버는 즉시 답하지 않는다.
const DELAY_MS = Number(process.env.DELAY_MS ?? 400);

// 로그인한 사람. 토큰을 발급하고 검사하는 데 쓴다.
const ME = { id: 1, username: 'jaehoon', profileImageUrl: seed('jaehoon', 64) };

function seed(name, size) {
  return `https://picsum.photos/seed/${name}/${size}/${size}`;
}

function post(id, username, mediaKind, content, hashtagNames, likeCount, commentCount, liked, createdAt) {
  return {
    id,
    username,
    profileImageUrl: seed(username, 64),
    imageUrl: seed(`post${id}`, 640),
    mediaKind,
    content,
    hashtagNames,
    likeCount,
    commentCount,
    liked,
    createdAt,
  };
}

// 프런트의 data/feed.ts 와 같은 열 장. 이제 이쪽이 원본이다.
const posts = [
  post(1, 'jaehoon', 'image', '오늘 한강 노을이 미쳤다', ['한강', '노을'], 1240, 32, false, '2026-07-20T18:30:00'),
  post(2, 'minji', 'carousel', '제주도 3박 4일 기록', ['제주도', '여행'], 8500, 214, true, '2026-07-19T09:10:00'),
  post(3, 'seungwoo', 'image', '한강 러닝 10km 완주했습니다', ['한강', '러닝'], 320, 12, false, '2026-07-18T07:05:00'),
  post(4, 'dahye', 'carousel', '성수동 카페 투어 첫 번째 집', ['카페', '디저트'], 2180, 64, false, '2026-07-17T14:40:00'),
  post(5, 'jiwon', 'image', '제주 애월 바다 보이는 카페', ['제주도', '카페'], 5410, 130, false, '2026-07-16T11:20:00'),
  post(6, 'taeyang', 'video', '새벽 다섯 시 러닝 크루 모집', ['러닝', '새벽'], 890, 41, false, '2026-07-15T05:30:00'),
  post(7, 'sora', 'image', '제주도 렌터카 없이 다니기', ['제주도', '여행'], 3720, 98, false, '2026-07-14T16:00:00'),
  post(8, 'hyunwoo', 'image', '노을 맛집 카페를 찾았어요', ['카페', '노을'], 1560, 27, false, '2026-07-13T18:55:00'),
  post(9, 'eunbi', 'carousel', '딸기 케이크가 이렇게 큽니다', ['디저트', '카페'], 4030, 152, false, '2026-07-12T13:15:00'),
  post(10, 'junho', 'image', '한강 야간 러닝 코스 추천합니다', ['한강', '러닝'], 610, 19, false, '2026-07-11T21:45:00'),
];

const comments = [
  { id: 1, postId: 1, username: 'minji', content: '와 여기 어디예요?', createdAt: '2026-07-20T18:40:00' },
  { id: 2, postId: 1, username: 'seungwoo', content: '노을 색이 진짜 좋네요', createdAt: '2026-07-20T18:52:00' },
  { id: 3, postId: 2, username: 'jaehoon', content: '3박 4일이면 넉넉했나요?', createdAt: '2026-07-19T09:30:00' },
];

let nextCommentId = 4;

// 발급한 토큰. 만료를 흉내 내려고 쓴 횟수를 센다.
const tokens = new Map();
let nextTokenId = 1;

function issueToken(kind) {
  const token = `${kind}-${nextTokenId++}`;
  tokens.set(token, { kind, uses: 0 });
  return token;
}

// 액세스 토큰은 세 번 쓰면 만료된다. 401 갱신을 눈으로 보려면 짧아야 한다.
const ACCESS_TOKEN_USES = Number(process.env.ACCESS_TOKEN_USES ?? 3);

function verifyAccessToken(header) {
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return 'missing';
  const token = header.slice('Bearer '.length);
  const found = tokens.get(token);
  if (found === undefined || found.kind !== 'access') return 'invalid';
  found.uses += 1;
  if (found.uses > ACCESS_TOKEN_USES) return 'expired';
  return 'ok';
}

function ok(res, data, status = 200) {
  send(res, status, { success: true, data, message: null });
}

function fail(res, status, message) {
  send(res, status, { success: false, data: null, message });
}

function send(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw === '' ? {} : JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 좋아요를 누른 횟수. 실패를 규칙적으로 내려면 세어야 한다.
let likeAttempts = 0;
const LIKE_FAIL_EVERY = Number(process.env.LIKE_FAIL_EVERY ?? 5);

const routes = [
  // 로그인 — 토큰 두 개를 발급한다.
  {
    method: 'POST',
    match: (path) => path === '/api/auth/login',
    handle: async (req, res) => {
      const body = await readBody(req);
      if (body.username !== ME.username) {
        return fail(res, 401, '아이디 또는 비밀번호가 올바르지 않습니다');
      }
      ok(res, { accessToken: issueToken('access'), refreshToken: issueToken('refresh'), user: ME });
    },
  },

  // 리프레시 — 액세스 토큰만 새로 발급한다.
  {
    method: 'POST',
    match: (path) => path === '/api/auth/refresh',
    handle: async (req, res) => {
      const body = await readBody(req);
      const found = tokens.get(body.refreshToken);
      if (found === undefined || found.kind !== 'refresh') {
        return fail(res, 401, '리프레시 토큰이 유효하지 않습니다');
      }
      ok(res, { accessToken: issueToken('access') });
    },
  },

  // 피드 — 인증이 없어도 볼 수 있다.
  {
    method: 'GET',
    match: (path) => path === '/api/posts',
    handle: async (_req, res) => ok(res, posts),
  },

  // 게시물 하나 — 없는 번호면 404 에 봉투를 실어 보낸다.
  {
    method: 'GET',
    match: (path) => /^\/api\/posts\/\d+$/.test(path),
    handle: async (req, res, path) => {
      const id = Number(path.split('/').at(-1));
      const found = posts.find((it) => it.id === id);
      if (found === undefined) return fail(res, 404, '게시물을 찾을 수 없습니다');
      ok(res, found);
    },
  },

  // 게시물의 댓글
  {
    method: 'GET',
    match: (path) => /^\/api\/posts\/\d+\/comments$/.test(path),
    handle: async (req, res, path) => {
      const id = Number(path.split('/').at(-2));
      ok(res, comments.filter((it) => it.postId === id));
    },
  },

  // 좋아요 — 토큰이 필요하고, 다섯 번에 한 번은 서버가 실패한다.
  {
    method: 'POST',
    match: (path) => /^\/api\/posts\/\d+\/like$/.test(path),
    handle: async (req, res, path) => {
      const auth = verifyAccessToken(req.headers.authorization);
      if (auth === 'missing') return fail(res, 401, '로그인이 필요합니다');
      if (auth === 'invalid') return fail(res, 401, '토큰이 유효하지 않습니다');
      if (auth === 'expired') return fail(res, 401, '액세스 토큰이 만료되었습니다');

      const id = Number(path.split('/').at(-2));
      const found = posts.find((it) => it.id === id);
      if (found === undefined) return fail(res, 404, '게시물을 찾을 수 없습니다');

      likeAttempts += 1;
      if (LIKE_FAIL_EVERY > 0 && likeAttempts % LIKE_FAIL_EVERY === 0) {
        return fail(res, 500, '좋아요를 저장하지 못했습니다');
      }

      found.liked = !found.liked;
      found.likeCount += found.liked ? 1 : -1;
      ok(res, { id: found.id, liked: found.liked, likeCount: found.likeCount });
    },
  },

  // 댓글 작성
  {
    method: 'POST',
    match: (path) => /^\/api\/posts\/\d+\/comments$/.test(path),
    handle: async (req, res, path) => {
      const auth = verifyAccessToken(req.headers.authorization);
      if (auth !== 'ok') return fail(res, 401, auth === 'expired' ? '액세스 토큰이 만료되었습니다' : '로그인이 필요합니다');

      const postId = Number(path.split('/').at(-2));
      const body = await readBody(req);
      const content = typeof body.content === 'string' ? body.content.trim() : '';
      if (content === '') return fail(res, 400, '댓글 내용을 입력해주세요');

      const created = { id: nextCommentId++, postId, username: ME.username, content, createdAt: '2026-08-14T10:00:00' };
      comments.push(created);
      const post = posts.find((it) => it.id === postId);
      if (post !== undefined) post.commentCount += 1;
      ok(res, created, 201);
    },
  },

  // 댓글 삭제 — 남의 댓글은 거절한다. 화면을 되돌려야 하는 자리다.
  {
    method: 'DELETE',
    match: (path) => /^\/api\/comments\/\d+$/.test(path),
    handle: async (req, res, path) => {
      const auth = verifyAccessToken(req.headers.authorization);
      if (auth !== 'ok') return fail(res, 401, auth === 'expired' ? '액세스 토큰이 만료되었습니다' : '로그인이 필요합니다');

      const id = Number(path.split('/').at(-1));
      const index = comments.findIndex((it) => it.id === id);
      if (index === -1) return fail(res, 404, '댓글을 찾을 수 없습니다');
      if (comments[index].username !== ME.username) {
        return fail(res, 403, '내가 쓴 댓글만 지울 수 있습니다');
      }

      const [removed] = comments.splice(index, 1);
      const post = posts.find((it) => it.id === removed.postId);
      if (post !== undefined) post.commentCount -= 1;
      ok(res, { id: removed.id });
    },
  },
];

const server = createServer(async (req, res) => {
  const path = new URL(req.url ?? '/', `http://localhost:${PORT}`).pathname;

  if (req.method === 'OPTIONS') {
    return send(res, 204, {});
  }

  await sleep(DELAY_MS);

  const route = routes.find((it) => it.method === req.method && it.match(path));
  if (route === undefined) {
    return fail(res, 404, `그런 주소는 없습니다: ${req.method} ${path}`);
  }

  try {
    await route.handle(req, res, path);
  } catch (error) {
    fail(res, 500, error instanceof Error ? error.message : '서버 오류');
  }
});

server.listen(PORT, () => {
  console.log(`[api-stub] http://localhost:${PORT}/api — 지연 ${DELAY_MS}ms · 좋아요는 ${LIKE_FAIL_EVERY}번에 한 번 실패 · 액세스 토큰은 ${ACCESS_TOKEN_USES}회 사용 후 만료`);
});
