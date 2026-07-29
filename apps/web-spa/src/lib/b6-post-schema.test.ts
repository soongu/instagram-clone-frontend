// apps/web-spa/src/lib/b6-post-schema.test.ts
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { PostSchema, FeedSchema } from './schemas';
import { isPost } from '../types/guards';
import { feedPosts } from '../data/feed';
import type { Post } from '../types/instagram';

// 컴파일이 되는 것 자체가 증거다 — 스키마에서 나온 타입과
// A-1 에서 손으로 선언한 Post 가 서로 대입된다
const fromSchema: z.infer<typeof PostSchema> = feedPosts[0]!;
const handWritten: Post = PostSchema.parse(feedPosts[0]);

// isPost 가 검사하는 네 항목만 맞고 나머지는 전부 어긋난 응답
const shapeLooksRight = {
  id: 1,
  username: 'jaehoon',
  imageUrl: 'https://picsum.photos/seed/post1/640/640',
  likeCount: 1240,
  profileImageUrl: null,
  mediaKind: 'gif',
  content: 42,
  hashtagNames: '한강',
  commentCount: '32',
  liked: 'false',
  createdAt: 0,
};

describe('PostSchema — 스키마에서 나온 타입과 손으로 쓴 타입이 같다', () => {
  it('둘은 서로 대입된다 — 위 두 줄이 컴파일된 것이 증거다', () => {
    expect(fromSchema).toEqual(handWritten);
  });
});

describe('PostSchema — 서버 응답에도 같은 도구를 쓴다', () => {
  it('앱이 실제로 쓰는 피드 데이터는 그대로 통과한다', () => {
    for (const post of feedPosts) {
      expect(PostSchema.safeParse(post).success).toBe(true);
    }
  });

  it('피드 전체는 배열 스키마로 한 번에 본다', () => {
    expect(FeedSchema.safeParse(feedPosts).success).toBe(true);
  });

  it('likeCount 가 문자열로 오면 막힌다 — 흔한 사고', () => {
    const result = PostSchema.safeParse({ ...feedPosts[0], likeCount: '1240' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['likeCount']);
  });

  it('mediaKind 는 정해둔 셋 말고는 못 들어온다', () => {
    const result = PostSchema.safeParse({ ...feedPosts[0], mediaKind: 'gif' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['mediaKind']);
  });
});

describe('컴파일러가 못 하는 일', () => {
  it('타입만으로는 못 막는다 — 껍데기만 있는 값도 컴파일은 통과한다', () => {
    // 아래 함수는 tsc 를 통과한다. parse 가 돌려주는 타입이 Post 와 같아서다.
    function buildPost(): Post {
      return PostSchema.parse({ id: 1 });
    }

    // 그런데 실행하면 던진다 — 실행 시점 검사만이 이걸 안다
    expect(() => buildPost()).toThrow(z.ZodError);
  });
});

describe('손으로 쓴 isPost 와 나란히 놓고 보기', () => {
  it('isPost 는 통과시킨다 — 네 항목만 보기 때문이다', () => {
    expect(isPost(shapeLooksRight)).toBe(true);
  });

  it('같은 응답을 스키마는 막는다', () => {
    expect(PostSchema.safeParse(shapeLooksRight).success).toBe(false);
  });

  it('스키마가 잡아내는 항목은 isPost 가 아예 안 보던 일곱 개다', () => {
    const result = PostSchema.safeParse(shapeLooksRight);
    const caughtFields = result.error?.issues.map((issue) => issue.path.join('.'));

    expect(caughtFields).toEqual([
      'profileImageUrl',
      'mediaKind',
      'content',
      'hashtagNames',
      'commentCount',
      'liked',
      'createdAt',
    ]);
  });

  it('flattenError 로 칸별 메시지를 한눈에 본다', () => {
    const result = PostSchema.safeParse(shapeLooksRight);
    const { fieldErrors, formErrors } = z.flattenError(result.error!);

    expect(formErrors).toEqual([]);
    expect(Object.keys(fieldErrors)).toHaveLength(7);
    expect(fieldErrors.content).toEqual(['Invalid input: expected string, received number']);
  });

  it('배열 안 몇 번째가 틀렸는지까지 알려준다', () => {
    const result = FeedSchema.safeParse([feedPosts[0], shapeLooksRight]);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual([1, 'profileImageUrl']);
  });
});
