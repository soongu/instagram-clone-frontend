// apps/web-spa/scratch/c9-server-harness.ts
//
// 쪽지·알림 쪽 :8090 응답을 흉내 낸다. 연습용 서버(apps/api-stub)와 같은 봉투·같은 주소.

import { http, HttpResponse, delay } from 'msw';
import type { DirectMessage } from '../src/types/dm';
import { API_BASE, ok, requestLog } from './c5-server-harness';

// 서버가 이미 들고 있는 쪽지들. 통로가 열리기 전에 오간 것이다.
export const seedMessages: DirectMessage[] = [
  {
    messageId: 1,
    conversationId: 1,
    senderUsername: 'minji',
    content: '한강 사진 그거 어디서 찍은 거예요?',
    createdAt: '2026-08-18T09:12:00',
  },
  {
    messageId: 2,
    conversationId: 1,
    senderUsername: 'jaehoon',
    content: '반포대교 남단이요! 해 지기 30분 전이 제일 좋아요',
    createdAt: '2026-08-18T09:14:00',
  },
];

export const fakeDmDb = {
  messages: seedMessages.map((it) => ({ ...it })),

  reset(): void {
    this.messages = seedMessages.map((it) => ({ ...it }));
  },
};

export function messagesHandler(delayMs = 0) {
  return http.get(`${API_BASE}/conversations/:conversationId/messages`, async ({ params }) => {
    const id = Number(params.conversationId);
    requestLog.push(`GET /api/conversations/${id}/messages`);
    if (delayMs > 0) await delay(delayMs);

    return HttpResponse.json(ok(fakeDmDb.messages.filter((it) => it.conversationId === id)));
  });
}

export function c9Handlers(delayMs = 0) {
  return [messagesHandler(delayMs)];
}
