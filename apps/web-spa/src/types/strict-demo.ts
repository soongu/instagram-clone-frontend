// apps/web-spa/src/types/strict-demo.ts

export interface StoredPost {
  id: number;
  content: string;
}

// find 는 "못 찾았을 때"가 있어서 undefined 가 섞인 타입을 돌려준다
export function findPost(posts: StoredPost[], id: number): StoredPost | undefined {
  return posts.find((post) => post.id === id);
}

// strict 는 못 찾은 경우를 처리해야만 통과시켜 준다
export function contentOf(posts: StoredPost[], id: number): string {
  const found = findPost(posts, id);
  if (found === undefined) {
    return '(삭제된 게시물입니다)';
  }
  return found.content;
}

export function countValidPosts(posts: StoredPost[], ids: number[]): number {
  let count = 0;
  for (const id of ids) {
    if (findPost(posts, id) !== undefined) {
      count += 1;
    }
  }
  return count;
}
