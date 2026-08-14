// apps/web-spa/src/api/c5-client.test.ts
// C-5 Step 3 — 단일 인스턴스와 봉투 벗기기 (내부 검증용)
import { http, HttpResponse } from 'msw';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { api, ApiError, API_BASE_URL } from './client';
import { fetchFeed, fetchPostById } from './posts';
import { server, API_BASE, ok, failure } from '../../scratch/c5-server-harness';
import { allPosts } from '../data/feed';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('인스턴스가 주소를 들고 있다', () => {
  it('baseURL 은 :8090/api 다', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:8090/api');
    expect(API_BASE_URL).toBe('http://localhost:8090/api');
  });

  it('부르는 쪽은 뒷부분만 안다', async () => {
    const response = await api.get('/posts');

    expect(response.config.url).toBe('/posts');
    expect(response.request.responseURL ?? `${API_BASE_URL}/posts`).toContain('/api/posts');
  });
});

describe('봉투를 벗긴다', () => {
  it('성공하면 data 칸 안에 있던 것만 온다', async () => {
    const posts = await fetchFeed();

    expect(posts).toHaveLength(allPosts.length);
    expect(posts[0]).not.toHaveProperty('success');
    expect(posts[0].username).toBe('jaehoon');
  });

  it('게시물 하나도 같은 방식으로 온다', async () => {
    const post = await fetchPostById(2);

    expect(post.username).toBe('minji');
    expect(post.hashtagNames).toEqual(['제주도', '여행']);
  });
});

describe('실패는 ApiError 하나로 모인다', () => {
  it('404 면 서버가 보낸 사유를 그대로 든다', async () => {
    const thrown = await fetchPostById(999).catch((error: unknown) => error);

    expect(thrown).toBeInstanceOf(ApiError);
    expect((thrown as ApiError).message).toBe('게시물을 찾을 수 없습니다');
    expect((thrown as ApiError).status).toBe(404);
  });

  it('200 으로 오면서 봉투만 실패인 경우도 실패로 만든다', async () => {
    server.use(http.get(`${API_BASE}/posts`, () => HttpResponse.json(failure('점검 중입니다'))));

    const thrown = await fetchFeed().catch((error: unknown) => error);

    expect(thrown).toBeInstanceOf(ApiError);
    expect((thrown as ApiError).message).toBe('점검 중입니다');
    expect((thrown as ApiError).status).toBe(200);
  });

  it('연결이 안 되면 우리가 쓴 말이 들어온다', async () => {
    server.use(http.get(`${API_BASE}/posts`, () => HttpResponse.error()));

    const thrown = await fetchFeed().catch((error: unknown) => error);

    expect(thrown).toBeInstanceOf(ApiError);
    expect((thrown as ApiError).message).toBe('서버에 연결할 수 없어요');
    expect((thrown as ApiError).status).toBeNull();
  });

  it('500 도 4xx 와 같은 길로 온다', async () => {
    server.use(
      http.get(`${API_BASE}/posts`, () =>
        HttpResponse.json(failure('피드를 만들지 못했습니다'), { status: 500 }),
      ),
    );

    const thrown = await fetchFeed().catch((error: unknown) => error);

    expect((thrown as ApiError).status).toBe(500);
    expect((thrown as ApiError).message).toBe('피드를 만들지 못했습니다');
  });
});

describe('화면에서 봉투를 여는 코드가 사라졌다', () => {
  it('화면과 그 훅 어디에도 success 도 .json 도 없다', async () => {
    const home = await import('../routes/HomePage.tsx?raw');
    const query = await import('../queries/posts.ts?raw');

    for (const source of [home.default, query.default]) {
      expect(source).not.toMatch(/success/);
      expect(source).not.toMatch(/\.json\(\)/);
    }

    // 부르는 일은 api 층에 남아 있다
    expect(query.default).toMatch(/fetchFeed/);
  });

  it('주소를 아는 곳은 client.ts 하나뿐이다', async () => {
    const home = await import('../routes/HomePage.tsx?raw');
    const posts = await import('./posts.ts?raw');
    const query = await import('../queries/posts.ts?raw');

    for (const source of [home.default, posts.default, query.default]) {
      expect(source).not.toMatch(/localhost:8090/);
    }
  });
});

describe('봉투 벗기기가 제네릭을 정직하게 만든다', () => {
  it('api.get<Post[]> 이 말하는 것이 실제로 손에 들어온다', async () => {
    const response = await api.get<{ id: number }[]>('/posts');

    // 봉투가 왔다면 response.data 는 배열이 아니라 객체였을 것이다
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data[0].id).toBe(1);
  });

  it('원래 봉투 모양은 이랬다 — 헬퍼로 확인', () => {
    expect(ok([{ id: 1 }])).toEqual({ success: true, data: [{ id: 1 }], message: null });
  });
});
