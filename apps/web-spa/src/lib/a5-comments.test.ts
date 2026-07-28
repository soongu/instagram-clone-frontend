// apps/web-spa/src/lib/a5-comments.test.ts
import { describe, it, expect } from 'vitest';
import { commentReducer, initialCommentState } from './comments';

describe('commentReducer — 댓글 목록과 다음 번호가 함께 움직인다', () => {
  it('처음 상태는 빈 목록과 1번', () => {
    expect(initialCommentState).toEqual({ items: [], nextId: 1 });
  });

  it('add 는 댓글을 붙이고 다음 번호를 하나 올린다', () => {
    const after = commentReducer(initialCommentState, { type: 'add', content: '멋져요' });

    expect(after.items).toEqual([{ id: 1, content: '멋져요' }]);
    expect(after.nextId).toBe(2);
  });

  it('remove 는 그 번호만 빼고 다음 번호는 건드리지 않는다', () => {
    const one = commentReducer(initialCommentState, { type: 'add', content: '첫째' });
    const two = commentReducer(one, { type: 'add', content: '둘째' });
    const after = commentReducer(two, { type: 'remove', id: 1 });

    expect(after.items).toEqual([{ id: 2, content: '둘째' }]);
    expect(after.nextId).toBe(3);
  });

  it('지운 자리의 번호를 다시 쓰지 않는다 — 지우고 새로 달아도 번호가 겹치지 않는다', () => {
    const one = commentReducer(initialCommentState, { type: 'add', content: '첫째' });
    const removed = commentReducer(one, { type: 'remove', id: 1 });
    const added = commentReducer(removed, { type: 'add', content: '다시' });

    expect(added.items).toEqual([{ id: 2, content: '다시' }]);
    expect(added.items.map((item) => item.id)).toEqual([2]);
  });

  it('원래 상태를 그 자리에서 고치지 않는다', () => {
    const before = commentReducer(initialCommentState, { type: 'add', content: '첫째' });
    const snapshot = structuredClone(before);

    commentReducer(before, { type: 'add', content: '둘째' });
    commentReducer(before, { type: 'remove', id: 1 });

    expect(before).toEqual(snapshot);
  });

  it('없는 번호를 지우라고 하면 목록이 그대로다', () => {
    const one = commentReducer(initialCommentState, { type: 'add', content: '첫째' });
    const after = commentReducer(one, { type: 'remove', id: 999 });

    expect(after.items).toEqual(one.items);
  });
});
