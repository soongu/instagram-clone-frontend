// apps/web-spa/src/lib/c8-post-events.test.ts
// C-8 Step 6 — 서버가 보낸 소식을 우리 것으로 받아들이기 전에 (내부 검증용)
import { describe, it, expect } from 'vitest';
import { applyPostEvent, parsePostEvent } from './postEvents';
import type { Post } from '../types/instagram';

const sample: Post[] = [
  {
    id: 1,
    username: 'jaehoon',
    profileImageUrl: '',
    imageUrl: '',
    mediaKind: 'image',
    content: '오늘 한강 노을이 미쳤다',
    hashtagNames: ['한강'],
    likeCount: 1240,
    commentCount: 32,
    liked: false,
    createdAt: '2026-07-20T18:30:00',
  },
  {
    id: 2,
    username: 'minji',
    profileImageUrl: '',
    imageUrl: '',
    mediaKind: 'image',
    content: '제주도',
    hashtagNames: ['제주도'],
    likeCount: 8500,
    commentCount: 214,
    liked: true,
    createdAt: '2026-07-19T09:10:00',
  },
];

describe('온 것을 우리 타입으로 좁힌다', () => {
  it('좋아요 소식을 알아본다', () => {
    const event = parsePostEvent('{"type":"like","postId":1,"likeCount":1300,"actor":"minji"}');

    expect(event).toEqual({ type: 'like', postId: 1, likeCount: 1300, actor: 'minji' });
  });

  it('댓글 소식을 알아본다', () => {
    const event = parsePostEvent('{"type":"comment","postId":2,"commentCount":215,"actor":"sora"}');

    expect(event?.type).toBe('comment');
  });

  it('★ 모양이 안 맞으면 null 이다 — 서버가 보냈다고 다 믿지 않는다', () => {
    expect(parsePostEvent('이건 JSON 도 아니다')).toBeNull();
    expect(parsePostEvent('{"type":"like"}')).toBeNull();
    expect(parsePostEvent('{"type":"like","postId":1}')).toBeNull();
    expect(parsePostEvent('{"type":"처음보는것","postId":1}')).toBeNull();
    expect(parsePostEvent('null')).toBeNull();
  });
});

describe('받아둔 피드에 소식을 얹는다', () => {
  it('그 게시물의 숫자만 갈린다', () => {
    const next = applyPostEvent(sample, {
      type: 'like',
      postId: 1,
      likeCount: 1300,
      actor: 'minji',
    });

    expect(next?.[0].likeCount).toBe(1300);
    expect(next?.[1].likeCount).toBe(8500);
  });

  it('★ 남이 누른 것은 내 하트를 안 건드린다', () => {
    const next = applyPostEvent(sample, {
      type: 'like',
      postId: 2,
      likeCount: 9000,
      actor: 'sora',
    });

    // 2번은 내가 이미 눌러둔 게시물이다. 숫자만 오르고 하트는 그대로여야 한다.
    expect(next?.[1].likeCount).toBe(9000);
    expect(next?.[1].liked).toBe(true);
  });

  it('바뀌지 않은 게시물은 있던 그대로 쓴다', () => {
    const next = applyPostEvent(sample, {
      type: 'like',
      postId: 1,
      likeCount: 1300,
      actor: 'minji',
    });

    // B-2 에서 배운 그대로 — 바뀐 것만 새로 만든다.
    expect(next?.[1]).toBe(sample[1]);
    expect(next?.[0]).not.toBe(sample[0]);
  });

  it('아직 아무것도 안 받아뒀으면 얹을 곳이 없다', () => {
    expect(
      applyPostEvent(undefined, { type: 'like', postId: 1, likeCount: 1300, actor: 'minji' }),
    ).toBeUndefined();
  });
});
