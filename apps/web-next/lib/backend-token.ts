// apps/web-next/lib/backend-token.ts
import { API_BASE } from './config';

/**
 * 백엔드가 발급한 출입증을 사람마다 하나씩 들고 있는다.
 *
 * 브라우저로는 한 글자도 안 나간다 — 이 파일은 서버에서만 돈다.
 * C-5 에서는 같은 토큰을 브라우저의 localStorage 에 뒀고, 그때 "서버가 쿠키를
 * 내려주도록 만들어져 있어야 한다" 며 미뤄둔 자리가 여기다. 이제 서버가 들고 있다.
 *
 * 서버 메모리라 서버를 끄면 사라진다. 사라져도 다시 받으면 그만이다.
 */
type Held = { accessToken: string; refreshToken: string };

const store = globalThis as typeof globalThis & { __backendTokens?: Map<string, Held> };
const tokens = (store.__backendTokens ??= new Map<string, Held>());

/**
 * 이 사람 몫의 출입증을 붙여 백엔드를 부른다.
 *
 * 백엔드 출입증은 몇 번 쓰면 만료된다. 만료되면(401) 새로 받아 딱 한 번 다시 시도한다.
 * 한 번으로 제한하는 것이 중요하다 — 새로 받은 것도 거절당하는 상황에서 계속 다시
 * 시도하면 그대로 무한 반복이 된다.
 */
export async function fetchAsUser(username: string, path: string, init?: RequestInit) {
  const held = tokens.get(username) ?? (await issueFor(username));

  if (held === null) {
    return null;
  }

  const first = await send(path, held.accessToken, init);

  if (first.status !== 401) {
    return first;
  }

  // 만료됐다. 우리 서버는 세션으로 이 사람을 이미 확인했으니 새 출입증을 받아올 자격이 있다.
  const renewed = await renew(username, held);

  if (renewed === null) {
    return first;
  }

  return send(path, renewed.accessToken, init);
}

function send(path: string, accessToken: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${accessToken}` },
  });
}

/** 우리 서버가 이미 확인한 사람이라고 백엔드에 알리고 출입증 한 벌을 받아온다. */
async function issueFor(username: string): Promise<Held | null> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    return null;
  }

  const envelope = await response.json();

  if (!envelope.success) {
    return null;
  }

  const held: Held = {
    accessToken: envelope.data.accessToken,
    refreshToken: envelope.data.refreshToken,
  };
  tokens.set(username, held);
  return held;
}

/** 갱신용 표를 내밀고 새 출입증만 받는다. 그것마저 거절당하면 처음부터 다시 받는다. */
async function renew(username: string, held: Held): Promise<Held | null> {
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: held.refreshToken }),
  });

  if (!response.ok) {
    tokens.delete(username);
    return issueFor(username);
  }

  const envelope = await response.json();

  if (!envelope.success) {
    tokens.delete(username);
    return issueFor(username);
  }

  const next: Held = { ...held, accessToken: envelope.data.accessToken };
  tokens.set(username, next);
  return next;
}
