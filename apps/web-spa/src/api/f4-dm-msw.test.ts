// apps/web-spa/src/api/f4-dm-msw.test.ts
// F-4 Step 1~2 — 진짜 client 를 그대로 두고 네트워크만 가로챈다.
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '../mocks/node';
import { fetchConversations } from './dm';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('fetchConversations — 서버 없이, 우리 코드는 그대로', () => {
  it('대화 목록이 온다', async () => {
    const conversations = await fetchConversations();

    expect(conversations).toHaveLength(1);
    expect(conversations[0].otherUsername).toBe('minji');
  });

  it('봉투를 벗기는 일은 인터셉터가 진짜로 한다', async () => {
    const conversations = await fetchConversations();

    // success·data·message 세 칸이 아니라, data 칸 안에 있던 것만 손에 들어온다.
    expect(conversations[0]).not.toHaveProperty('success');
    expect(conversations[0].lastMessage).toBe('반포대교 남단이요! 해 지기 30분 전이 제일 좋아요');
  });
});
