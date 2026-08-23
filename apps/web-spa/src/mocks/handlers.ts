// apps/web-spa/src/mocks/handlers.ts
//
// 서버가 이렇게 답한다고 우리가 적어둔 목록.
// 테스트도 이 목록을 쓰고, 개발 중인 브라우저도 이 목록을 쓴다.
//
// ⚠️ 주소를 여기에 그대로 적는 이유
// 이 파일은 "서버 쪽" 을 흉내 내는 자리다. 그래서 client.ts 의 API_BASE_URL 을
// 가져다 쓰지 않고 주소를 직접 적는다. 가져다 쓰면 우리 코드가 주소를 틀리게
// 바꿔도 핸들러가 같이 따라 움직여서 아무 일도 없는 것처럼 보인다.
import { http, HttpResponse, delay } from 'msw';
import type { Conversation, DirectMessage } from '../types/dm';
import { allPosts } from '../data/feed';

export const MOCK_API_BASE = 'http://localhost:8090/api';

/** 연습용 서버가 씌워 보내는 봉투와 같은 세 칸 */
export function ok<T>(data: T) {
  return { success: true, data, message: null };
}

/** 서버가 "안 됐다" 고 말할 때의 봉투. data 자리는 비고 사유가 들어온다. */
export function failure(message: string) {
  return { success: false, data: null, message };
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

export const mockMessages: DirectMessage[] = [
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

// 진짜 서버는 즉시 답하지 않는다. 늦게 오는 동안 화면이 무엇을 보여주는지도
// 확인해야 하므로, 흉내 서버도 기다리는 시간을 가질 수 있어야 한다.
export const FEED_DELAY_MS = 100;

// 연습용 서버에 있는 사람들. 이 목록에 없으면 서버가 거절한다.
export const mockUsers = ['jaehoon', 'minji'];

// 서버가 실제로 받은 요청 본문을 여기에 쌓아둔다.
// 돌려받은 값만 봐서는 "우리가 무엇을 보냈는지" 를 알 수 없다.
export const receivedLoginBodies: unknown[] = [];

// 좋아요는 누를 때마다 뒤집힌다. 흉내 서버도 그 사이를 기억해야
// 두 번 누르면 원래대로 돌아온다. 판마다 새로 시작하려고 비우는 함수도 함께 둔다.
const likeState = new Map<number, { liked: boolean; likeCount: number }>();

export function resetLikeState() {
  likeState.clear();
}

export const handlers = [
  // 보내는 요청. 본문은 request.json() 으로 읽는다.
  http.post(`${MOCK_API_BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { username?: string };
    receivedLoginBodies.push(body);

    if (body.username === undefined || !mockUsers.includes(body.username)) {
      return HttpResponse.json(failure('아이디 또는 비밀번호가 올바르지 않습니다'), { status: 401 });
    }

    return HttpResponse.json(
      ok({
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        user: {
          id: 1,
          username: body.username,
          profileImageUrl: `https://picsum.photos/seed/${body.username}/64/64`,
        },
      }),
    );
  }),

  // 태그가 붙어 오면 그것만 골라 준다 — 연습용 서버와 같은 규약.
  http.get(`${MOCK_API_BASE}/posts`, async ({ request }) => {
    await delay(FEED_DELAY_MS);
    const tag = new URL(request.url).searchParams.get('tag');
    const shown = tag === null ? allPosts : allPosts.filter((post) => post.hashtagNames.includes(tag));

    // 좋아요를 누른 뒤 목록을 다시 물어보면 그 사실이 반영돼 있어야 한다.
    // 안 그러면 눌러서 올라간 숫자가 다시 물어보는 순간 옛 값으로 되돌아간다.
    return HttpResponse.json(ok(shown.map((post) => ({ ...post, ...likeState.get(post.id) }))));
  }),

  // 하트를 누르면 오는 요청. 지난 시간 과제로 남겨뒀던 자리다.
  http.post(`${MOCK_API_BASE}/posts/:postId/like`, ({ params }) => {
    const id = Number(params.postId);
    const post = allPosts.find((item) => item.id === id);

    if (post === undefined) {
      return HttpResponse.json(failure('없는 게시물이에요'), { status: 404 });
    }

    const current = likeState.get(id) ?? { liked: post.liked, likeCount: post.likeCount };
    const next = {
      liked: !current.liked,
      likeCount: current.likeCount + (current.liked ? -1 : 1),
    };
    likeState.set(id, next);

    return HttpResponse.json(ok({ id, ...next }));
  }),

  http.get(`${MOCK_API_BASE}/conversations`, () => HttpResponse.json(ok(mockConversations))),

  // 주소 가운데가 바뀌는 자리는 :이름 으로 받는다. 받은 값은 params 에 들어온다.
  http.get(`${MOCK_API_BASE}/conversations/:conversationId/messages`, ({ params }) => {
    const id = Number(params.conversationId);

    return HttpResponse.json(ok(mockMessages.filter((message) => message.conversationId === id)));
  }),
];
