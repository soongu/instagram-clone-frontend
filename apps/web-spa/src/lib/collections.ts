// apps/web-spa/src/lib/collections.ts

// 게시물이든 댓글이든 "번호로 찾는다" 는 똑같다.
// 다른 것은 담긴 것의 타입뿐이라, 그 타입만 나중에 정하도록 비워둔다.
// 다만 아무 타입이나 받을 수는 없다 — id 가 있어야 번호로 찾을 수 있다.
export function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

export function removeById<T extends { id: number }>(items: T[], id: number): T[] {
  return items.filter((item) => item.id !== id);
}
