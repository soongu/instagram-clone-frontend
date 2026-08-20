// apps/web-next/lib/backend-token.ts
import { API_BASE } from './config';

/**
 * 백엔드가 발급한 출입증을 사람마다 하나씩 들고 있는다.
 *
 * 브라우저로는 한 글자도 안 나간다 — 이 파일은 서버에서만 돈다.
 * C-5 에서는 같은 토큰을 브라우저의 localStorage 에 뒀는데,
 * 그때 "서버가 쿠키를 내려주도록 만들어져 있어야 한다" 고 미뤄둔 자리가 여기다.
 *
 * 서버 메모리라 서버를 끄면 사라진다. 사라져도 다시 받으면 그만이다.
 */
const store = globalThis as typeof globalThis & { __backendTokens?: Map<string, string> };
const tokens = (store.__backendTokens ??= new Map<string, string>());

/** 이 사람 몫의 출입증. 없으면 백엔드에 받아온다. */
export async function backendTokenFor(username: string): Promise<string | null> {
  const held = tokens.get(username);
  if (held !== undefined) {
    return held;
  }
  return issueFor(username);
}

async function issueFor(username: string): Promise<string | null> {
  // 우리 서버는 이미 세션으로 이 사람을 확인했다. 백엔드에 그 사실을 알리고 출입증을 받는다.
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

  tokens.set(username, envelope.data.accessToken);
  return envelope.data.accessToken;
}
