// apps/web-spa/src/mocks/handlers.ts
//
// 서버가 이렇게 답한다고 우리가 적어둔 목록.
// 테스트도 이 목록을 쓰고, 개발 중인 브라우저도 이 목록을 쓴다.
//
// ⚠️ 주소를 여기에 그대로 적는 이유
// 이 파일은 "서버 쪽" 을 흉내 내는 자리다. 그래서 client.ts 의 API_BASE_URL 을
// 가져다 쓰지 않고 주소를 직접 적는다. 가져다 쓰면 우리 코드가 주소를 틀리게
// 바꿔도 핸들러가 같이 따라 움직여서 아무 일도 없는 것처럼 보인다.
import { http, HttpResponse } from 'msw';
import type { Conversation } from '../types/dm';

export const MOCK_API_BASE = 'http://localhost:8090/api';

/** 연습용 서버가 씌워 보내는 봉투와 같은 세 칸 */
export function ok<T>(data: T) {
  return { success: true, data, message: null };
}

export const mockConversations: Conversation[] = [
  {
    conversationId: 1,
    otherUsername: 'minji',
    otherProfileImageUrl: 'https://picsum.photos/seed/minji/64/64',
    lastMessage: '반포대교 남단이요! 해 지기 30분 전이 제일 좋아요',
    lastMessageAt: '2026-08-18T09:14:00',
  },
];

export const handlers = [
  http.get(`${MOCK_API_BASE}/conversations`, () => HttpResponse.json(ok(mockConversations))),
];
