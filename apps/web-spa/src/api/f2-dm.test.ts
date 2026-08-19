// apps/web-spa/src/api/f2-dm.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 진짜 client 를 치우고 우리가 만든 가짜를 그 자리에 놓는다.
// 이 줄은 파일 맨 위로 끌어올려져서 아래 import 보다 먼저 실행된다.
vi.mock('./client', () => ({
  api: { get: vi.fn() },
}));

import { api } from './client';
import { fetchConversations, fetchMessages } from './dm';

// 가짜는 불린 기록을 계속 쌓아둔다. 판마다 지우고 시작한다.
beforeEach(() => {
  vi.mocked(api.get).mockReset();
  vi.mocked(api.get).mockResolvedValue({ data: [] });
});

describe('fetchConversations — 서버 없이 돌려본다', () => {
  it('봉투를 벗긴 배열이 그대로 나온다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [{ id: 3, partnerName: 'minji' }],
    });

    const conversations = await fetchConversations();

    expect(conversations).toEqual([{ id: 3, partnerName: 'minji' }]);
  });
});

// 돌려받은 값만 봐서는 절대 못 잡는 것이 있다 — 무엇을 물었는지.
// 방 번호가 주소에 안 들어가면 남의 방 쪽지를 가져오는데,
// 가짜가 무엇을 돌려주든 결과는 똑같아 보인다.
describe('fetchMessages — 무엇을 물었는지 가짜에게 확인한다', () => {
  it('방 번호가 주소에 들어간다', async () => {
    await fetchMessages(7);

    expect(api.get).toHaveBeenCalledWith('/conversations/7/messages');
  });

  it('한 번만 묻는다', async () => {
    await fetchMessages(7);

    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it('방마다 다른 주소로 묻는다', async () => {
    await fetchMessages(1);
    await fetchMessages(2);

    expect(vi.mocked(api.get).mock.calls).toEqual([
      ['/conversations/1/messages'],
      ['/conversations/2/messages'],
    ]);
  });
});
