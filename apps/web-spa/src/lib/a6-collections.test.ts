// apps/web-spa/src/lib/a6-collections.test.ts
import { describe, it, expect } from 'vitest';
import { findById, removeById } from './collections';
import { feedPosts } from '../data/feed';

const comments = [
  { id: 1, content: '첫째' },
  { id: 2, content: '둘째' },
];

describe('findById — 어떤 목록에서든 번호로 하나를 찾는다', () => {
  it('게시물에서 찾으면 게시물이 나온다', () => {
    const found = findById(feedPosts, 2);

    expect(found?.username).toBe('minji');
  });

  it('댓글에서 찾으면 댓글이 나온다', () => {
    expect(findById(comments, 1)?.content).toBe('첫째');
  });

  it('없으면 undefined', () => {
    expect(findById(comments, 999)).toBeUndefined();
  });
});

describe('removeById — 그 번호만 빼고 새 배열을 돌려준다', () => {
  it('해당 항목만 빠진다', () => {
    expect(removeById(comments, 1)).toEqual([{ id: 2, content: '둘째' }]);
  });

  it('없는 번호면 같은 내용이 나온다', () => {
    expect(removeById(comments, 999)).toEqual(comments);
  });

  it('원본을 건드리지 않는다', () => {
    removeById(comments, 1);

    expect(comments).toHaveLength(2);
  });

  it('게시물에도 그대로 쓰인다', () => {
    const left = removeById(feedPosts, 1);

    expect(left).toHaveLength(1);
    expect(left[0].username).toBe('minji');
  });
});
