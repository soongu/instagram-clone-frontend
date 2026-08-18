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

import { createStompBroker } from './stomp.mjs';
import { upgradeToWebSocket } from './websocket.mjs';

const PORT = Number(process.env.PORT ?? 8090);

// 지연 시간. 진짜 서버는 즉시 답하지 않는다.
const DELAY_MS = Number(process.env.DELAY_MS ?? 400);

// 로그인할 수 있는 사람들. 쪽지는 두 사람이 없으면 시연이 안 된다.
// 탭을 두 개 띄우고 각각 다른 사람으로 로그인해 보라는 뜻이다.
const USERS = [
  { id: 1, username: 'jaehoon', profileImageUrl: seed('jaehoon', 64) },
  { id: 2, username: 'minji', profileImageUrl: seed('minji', 64) },
];

function findUser(username) {
  return USERS.find((it) => it.username === username);
}

// 프로필 화면이 쓰는 집계값. 게시물을 올린 사람은 로그인 계정이 없어도 프로필이 있다.
const FOLLOWER_COUNTS = {
  jaehoon: 1_240,
  minji: 8_500,
  seungwoo: 320,
  dahye: 2_180,
};

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

// 대화방. 두 사람이 한 방을 같이 쓴다.
const conversations = [{ conversationId: 1, participants: ['jaehoon', 'minji'] }];

// 주고받은 쪽지. 새로고침해도 남아 있어야 하니 서버가 들고 있는다.
const directMessages = [
  { messageId: 1, conversationId: 1, senderUsername: 'minji', content: '한강 사진 그거 어디서 찍은 거예요?', createdAt: '2026-08-18T09:12:00' },
  { messageId: 2, conversationId: 1, senderUsername: 'jaehoon', content: '반포대교 남단이요! 해 지기 30분 전이 제일 좋아요', createdAt: '2026-08-18T09:14:00' },
];

let nextMessageId = 3;

// 알림. 게시물 주인에게만 쌓인다.
const notifications = [];
let nextNotificationId = 1;

function conversationOf(id) {
  return conversations.find((it) => it.conversationId === id);
}

function otherParticipant(conversation, me) {
  return conversation.participants.find((it) => it !== me);
}

// 발급한 토큰. 만료를 흉내 내려고 쓴 횟수를 센다.
// 누구의 토큰인지도 함께 담는다 — 이제 사람이 둘이라 구분해야 한다.
const tokens = new Map();
let nextTokenId = 1;

function issueToken(kind, username) {
  const token = `${kind}-${nextTokenId++}`;
  tokens.set(token, { kind, username, uses: 0 });
  return token;
}

// 액세스 토큰은 세 번 쓰면 만료된다. 401 갱신을 눈으로 보려면 짧아야 한다.
const ACCESS_TOKEN_USES = Number(process.env.ACCESS_TOKEN_USES ?? 3);

// 검사 결과와 "누구인지" 를 함께 돌려준다.
function verifyAccessToken(header) {
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
    return { status: 'missing', username: null };
  }
  const token = header.slice('Bearer '.length);
  const found = tokens.get(token);
  if (found === undefined || found.kind !== 'access') {
    return { status: 'invalid', username: null };
  }
  found.uses += 1;
  if (found.uses > ACCESS_TOKEN_USES) {
    return { status: 'expired', username: found.username };
  }
  return { status: 'ok', username: found.username };
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

// 실시간 통로. HTTP 서버와 같은 포트를 쓴다.
const broker = createStompBroker({ log: (line) => console.log(line) });

// 백엔드 과목의 StompController 와 같은 자리다. /app 으로 들어오면 여기서 받는다.
broker.onAppMessage('/app/ping', (payload) => {
  broker.broadcast('/topic/pong', { response: `PONG: ${payload.message}`, timestamp: Date.now() });
});

/**
 * 알림 하나를 쌓고, 받는 사람이 지금 붙어 있으면 통로로도 보낸다.
 *
 * 자기가 자기 게시물에 한 일은 알리지 않는다.
 */
function notify(receiver, actor, { type, targetId, message }) {
  if (receiver === actor) return;

  const created = {
    notificationId: nextNotificationId++,
    type,
    senderUsername: actor,
    senderProfileImageUrl: seed(actor, 64),
    targetId,
    message,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  // 누구에게 온 것인지는 서버만 알면 된다. 보낼 때는 빼고 보낸다.
  notifications.push({ receiverUsername: receiver, notification: created });

  broker.sendToUser(receiver, '/queue/notifications', created);
}

/**
 * 쪽지 보내기. 백엔드 과목의 @MessageMapping("/dm.send") 와 같은 자리다.
 *
 * 받는 사람과 보낸 사람 양쪽의 /user/queue/dm 으로 같은 것을 보낸다.
 * 보낸 사람에게 되돌려 보내는 것이 곧 "서버까지 갔다" 는 확인이다
 * (백엔드에서는 @SendToUser 가 그 일을 한다).
 */
broker.onAppMessage('/app/dm.send', (payload, session) => {
  const sender = session.username;
  const conversation = conversationOf(Number(payload.conversationId));

  if (conversation === undefined || !conversation.participants.includes(sender)) {
    return broker.sendToUser(sender, '/queue/errors', {
      code: 'CONVERSATION_NOT_FOUND',
      message: '참여하지 않은 대화방입니다',
      clientId: payload.clientId ?? null,
    });
  }

  const content = typeof payload.content === 'string' ? payload.content.trim() : '';
  if (content === '') {
    return broker.sendToUser(sender, '/queue/errors', {
      code: 'EMPTY_CONTENT',
      message: '내용을 입력해주세요',
      clientId: payload.clientId ?? null,
    });
  }

  const created = {
    messageId: nextMessageId++,
    conversationId: conversation.conversationId,
    senderUsername: sender,
    content,
    createdAt: new Date().toISOString(),
    // 보낸 쪽이 "내가 방금 보낸 그것" 을 알아보라고 그대로 실어 돌려준다.
    clientId: payload.clientId ?? null,
  };
  directMessages.push(created);

  broker.sendToUser(sender, '/queue/dm', created);
  broker.sendToUser(otherParticipant(conversation, sender), '/queue/dm', created);
});

const routes = [
  // 로그인 — 토큰 두 개를 발급한다.
  {
    method: 'POST',
    match: (path) => path === '/api/auth/login',
    handle: async (req, res) => {
      const body = await readBody(req);
      const user = findUser(body.username);
      if (user === undefined) {
        return fail(res, 401, '아이디 또는 비밀번호가 올바르지 않습니다');
      }
      ok(res, {
        accessToken: issueToken('access', user.username),
        refreshToken: issueToken('refresh', user.username),
        user,
      });
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
      ok(res, { accessToken: issueToken('access', found.username) });
    },
  },

  // 피드 — 인증이 없어도 볼 수 있다. tag 나 username 이 붙으면 그것만 골라 준다.
  {
    method: 'GET',
    match: (path) => path === '/api/posts',
    handle: async (req, res) => {
      const params = new URL(req.url ?? '/', `http://localhost:${PORT}`).searchParams;
      const tag = params.get('tag');
      const username = params.get('username');
      let found = posts;
      if (tag !== null) found = found.filter((post) => post.hashtagNames.includes(tag));
      if (username !== null) found = found.filter((post) => post.username === username);
      return ok(res, found);
    },
  },

  // 프로필 — 게시물을 올린 사람이면 로그인 계정이 없어도 프로필이 있다.
  {
    method: 'GET',
    match: (path) => /^\/api\/users\/[^/]+$/.test(path),
    handle: async (req, res, path) => {
      const username = decodeURIComponent(path.split('/').at(-1));
      if (!posts.some((it) => it.username === username)) {
        return fail(res, 404, '그런 사람이 없습니다');
      }
      ok(res, {
        username,
        profileImageUrl: seed(username, 64),
        followerCount: FOLLOWER_COUNTS[username] ?? 0,
      });
    },
  },

  // 이 사람이 자주 쓴 해시태그 — 전부 훑어서 세는 집계라 다른 것보다 오래 걸린다.
  {
    method: 'GET',
    match: (path) => /^\/api\/users\/[^/]+\/tags$/.test(path),
    extraDelayMs: 800,
    handle: async (req, res, path) => {
      const username = decodeURIComponent(path.split('/').at(-2));
      const mine = posts.filter((it) => it.username === username);
      if (mine.length === 0) {
        return fail(res, 404, '그런 사람이 없습니다');
      }
      ok(res, [...new Set(mine.flatMap((it) => it.hashtagNames))]);
    },
  },

  // 태그 목록 — 화면이 게시물에서 뽑아 쓰지 않게 서버가 준다.
  {
    method: 'GET',
    match: (path) => path === '/api/tags',
    handle: async (_req, res) => ok(res, [...new Set(posts.flatMap((post) => post.hashtagNames))]),
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
      if (auth.status === 'missing') return fail(res, 401, '로그인이 필요합니다');
      if (auth.status === 'invalid') return fail(res, 401, '토큰이 유효하지 않습니다');
      if (auth.status === 'expired') return fail(res, 401, '액세스 토큰이 만료되었습니다');

      const id = Number(path.split('/').at(-2));
      const found = posts.find((it) => it.id === id);
      if (found === undefined) return fail(res, 404, '게시물을 찾을 수 없습니다');

      likeAttempts += 1;
      if (LIKE_FAIL_EVERY > 0 && likeAttempts % LIKE_FAIL_EVERY === 0) {
        return fail(res, 500, '좋아요를 저장하지 못했습니다');
      }

      found.liked = !found.liked;
      found.likeCount += found.liked ? 1 : -1;

      // 누른 사람에게만 답하고 끝내지 않는다. 열려 있는 연결 전부에 알린다.
      broker.broadcast('/topic/posts', {
        type: 'like',
        postId: found.id,
        likeCount: found.likeCount,
        actor: auth.username,
      });

      // 게시물 주인에게는 따로 알림이 간다. 모두가 아니라 한 사람에게만 가는 소식이다.
      if (found.liked) {
        notify(found.username, auth.username, {
          type: 'LIKE',
          targetId: found.id,
          message: `${auth.username} 님이 회원님의 게시물을 좋아합니다`,
        });
      }

      ok(res, { id: found.id, liked: found.liked, likeCount: found.likeCount });
    },
  },

  // 댓글 작성
  {
    method: 'POST',
    match: (path) => /^\/api\/posts\/\d+\/comments$/.test(path),
    handle: async (req, res, path) => {
      const auth = verifyAccessToken(req.headers.authorization);
      if (auth.status !== 'ok') {
        return fail(res, 401, auth.status === 'expired' ? '액세스 토큰이 만료되었습니다' : '로그인이 필요합니다');
      }

      const postId = Number(path.split('/').at(-2));
      const body = await readBody(req);
      const content = typeof body.content === 'string' ? body.content.trim() : '';
      if (content === '') return fail(res, 400, '댓글 내용을 입력해주세요');

      const created = { id: nextCommentId++, postId, username: auth.username, content, createdAt: '2026-08-14T10:00:00' };
      comments.push(created);
      const post = posts.find((it) => it.id === postId);
      if (post !== undefined) post.commentCount += 1;

      broker.broadcast('/topic/posts', {
        type: 'comment',
        postId,
        commentCount: post?.commentCount ?? 0,
        actor: auth.username,
      });

      if (post !== undefined) {
        notify(post.username, auth.username, {
          type: 'COMMENT',
          targetId: postId,
          message: `${auth.username} 님이 댓글을 남겼습니다: ${content}`,
        });
      }

      ok(res, created, 201);
    },
  },

  // 내 대화 목록 — 상대가 누구인지와 마지막 쪽지를 함께 준다.
  {
    method: 'GET',
    match: (path) => path === '/api/conversations',
    handle: async (req, res) => {
      const auth = verifyAccessToken(req.headers.authorization);
      if (auth.status !== 'ok') return fail(res, 401, '로그인이 필요합니다');

      const mine = conversations
        .filter((it) => it.participants.includes(auth.username))
        .map((it) => {
          const other = otherParticipant(it, auth.username);
          const last = directMessages.filter((dm) => dm.conversationId === it.conversationId).at(-1);
          return {
            conversationId: it.conversationId,
            otherUsername: other,
            otherProfileImageUrl: seed(other, 64),
            lastMessage: last?.content ?? null,
            lastMessageAt: last?.createdAt ?? null,
          };
        });

      ok(res, mine);
    },
  },

  // 대화방의 쪽지 이력 — 통로가 열리기 전에 있던 것은 여기로 받는다.
  {
    method: 'GET',
    match: (path) => /^\/api\/conversations\/\d+\/messages$/.test(path),
    handle: async (req, res, path) => {
      const auth = verifyAccessToken(req.headers.authorization);
      if (auth.status !== 'ok') return fail(res, 401, '로그인이 필요합니다');

      const id = Number(path.split('/').at(-2));
      const conversation = conversationOf(id);
      if (conversation === undefined || !conversation.participants.includes(auth.username)) {
        return fail(res, 404, '대화방을 찾을 수 없습니다');
      }

      ok(res, directMessages.filter((it) => it.conversationId === id));
    },
  },

  // 내 알림 목록 — 최근 것이 위로 온다.
  {
    method: 'GET',
    match: (path) => path === '/api/notifications',
    handle: async (req, res) => {
      const auth = verifyAccessToken(req.headers.authorization);
      if (auth.status !== 'ok') return fail(res, 401, '로그인이 필요합니다');

      const mine = notifications
        .filter((it) => it.receiverUsername === auth.username)
        .map((it) => it.notification)
        .toReversed();

      ok(res, mine);
    },
  },

  // 댓글 삭제 — 남의 댓글은 거절한다. 화면을 되돌려야 하는 자리다.
  {
    method: 'DELETE',
    match: (path) => /^\/api\/comments\/\d+$/.test(path),
    handle: async (req, res, path) => {
      const auth = verifyAccessToken(req.headers.authorization);
      if (auth.status !== 'ok') {
        return fail(res, 401, auth.status === 'expired' ? '액세스 토큰이 만료되었습니다' : '로그인이 필요합니다');
      }

      const id = Number(path.split('/').at(-1));
      const index = comments.findIndex((it) => it.id === id);
      if (index === -1) return fail(res, 404, '댓글을 찾을 수 없습니다');
      if (comments[index].username !== auth.username) {
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

  // 집계처럼 원래 오래 걸리는 주소는 더 잔다.
  if (route.extraDelayMs !== undefined) {
    await sleep(route.extraDelayMs);
  }

  try {
    await route.handle(req, res, path);
  } catch (error) {
    fail(res, 500, error instanceof Error ? error.message : '서버 오류');
  }
});

// 업그레이드 요청은 보통 요청과 다른 문으로 들어온다.
server.on('upgrade', (req, socket) => {
  const path = new URL(req.url ?? '/', `http://localhost:${PORT}`).pathname;

  // 규약이 아무것도 없는 날 통로. 보낸 것을 그대로 돌려주기만 한다.
  // STOMP 가 무엇을 해주는지 대조해 보려고 열어둔다.
  if (path === '/ws-raw') {
    let connection = null;
    connection = upgradeToWebSocket(req, socket, {
      onMessage: (text) => connection?.send(`서버가 받은 것: ${text}`),
      onClose: () => {},
    });
    // 서버도 먼저 말할 수 있다는 것을 보여준다.
    setTimeout(() => connection?.send('서버가 먼저 보내는 인사'), 300);
    return;
  }

  if (path !== '/ws') {
    socket.end('HTTP/1.1 404 Not Found\r\n\r\n');
    return;
  }
  broker.handleUpgrade(req, socket);
});

server.listen(PORT, () => {
  console.log(`[api-stub] http://localhost:${PORT}/api — 지연 ${DELAY_MS}ms · 좋아요는 ${LIKE_FAIL_EVERY}번에 한 번 실패 · 액세스 토큰은 ${ACCESS_TOKEN_USES}회 사용 후 만료`);
  console.log(`[api-stub] ws://localhost:${PORT}/ws — STOMP · /topic 구독 · /app 으로 보내기`);
  console.log(`[api-stub] 로그인할 수 있는 사람: ${USERS.map((it) => it.username).join(' · ')} — 탭마다 다른 사람으로 들어가 보세요`);
});
