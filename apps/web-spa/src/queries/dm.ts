// apps/web-spa/src/queries/dm.ts
import { queryOptions } from '@tanstack/react-query';
import { fetchMessages } from '../api/dm';

// 대화방 하나의 쪽지들. 방마다 따로 담아야 하니 번호가 이름에 들어간다.
export function dmKey(conversationId: number) {
  return ['dm', conversationId] as const;
}

// 키와 부를 함수를 한 덩어리로 묶는다. 통로도 화면도 이 하나를 가져다 쓴다 —
// 키가 어긋날 자리가 없어진다 (C-5 의 postQuery 와 같은 모양).
export function messagesQuery(conversationId: number) {
  return queryOptions({
    queryKey: dmKey(conversationId),
    queryFn: () => fetchMessages(conversationId),
  });
}
