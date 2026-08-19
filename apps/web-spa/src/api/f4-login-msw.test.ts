// apps/web-spa/src/api/f4-login-msw.test.ts
// F-4 Step 6 — 보내는 요청. 서버가 실제로 받은 본문을 읽어 확인한다.
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { server } from '../mocks/node';
import { receivedLoginBodies } from '../mocks/handlers';
import { login } from './auth';
import { tokenStore } from '../lib/tokens';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  receivedLoginBodies.length = 0;
  tokenStore.clear();
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('login — 무엇을 보냈는지 서버 쪽에서 확인한다', () => {
  it('아는 사람이면 그 사람이 돌아온다', async () => {
    const user = await login('jaehoon');

    expect(user.username).toBe('jaehoon');
  });

  it('★ 서버가 받은 본문이 { username } 이다', async () => {
    await login('jaehoon');

    expect(receivedLoginBodies).toEqual([{ username: 'jaehoon' }]);
  });

  it('받아온 토큰이 저장된다', async () => {
    await login('jaehoon');

    expect(tokenStore.access()).toBe('access-1');
  });
});

// 핸들러가 진짜 서버처럼 거절하기 시작하니 앱의 결함이 드러났다.
// 그전에는 흉내 서버가 아무 아이디로나 로그인시켜서 이 갈래가 아예 안 돌았다.
describe('서버가 거절하는 경우', () => {
  it('★ 서버가 보낸 사유가 그대로 올라온다', async () => {
    await expect(login('nobody-such-user')).rejects.toThrow(
      '아이디 또는 비밀번호가 올바르지 않습니다',
    );
  });

  it('거절당했으면 토큰이 저장되지 않는다', async () => {
    await expect(login('nobody-such-user')).rejects.toThrow();

    expect(tokenStore.access()).toBeNull();
  });
});
