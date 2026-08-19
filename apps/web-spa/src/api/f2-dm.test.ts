// apps/web-spa/src/api/f2-dm.test.ts
import { describe, it, expect, vi } from 'vitest';

// 진짜 client 를 치우고 우리가 만든 가짜를 그 자리에 놓는다.
// 이 줄은 파일 맨 위로 끌어올려져서 아래 import 보다 먼저 실행된다.
vi.mock('./client', () => ({
  api: { get: vi.fn() },
}));

import { api } from './client';
import { fetchConversations } from './dm';

describe('fetchConversations — 서버 없이 돌려본다', () => {
  it('봉투를 벗긴 배열이 그대로 나온다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [{ id: 3, partnerName: 'minji' }],
    });

    const conversations = await fetchConversations();

    expect(conversations).toEqual([{ id: 3, partnerName: 'minji' }]);
  });
});
