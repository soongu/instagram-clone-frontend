// apps/web-spa/src/queries/dm.ts

// 대화방 하나의 쪽지들. 방마다 따로 담아야 하니 번호가 이름에 들어간다.
export function dmKey(conversationId: number) {
  return ['dm', conversationId] as const;
}
