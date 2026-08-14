// apps/web-spa/src/api/c5-fetch-vs-axios.test.ts
// C-5 Step 2 — 같은 404 를 두 도구가 다르게 받는다 (내부 검증용)
import axios, { AxiosError } from 'axios';
import { http, HttpResponse } from 'msw';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server, API_BASE, failure } from '../../scratch/c5-server-harness';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function notFound() {
  server.use(
    http.get(`${API_BASE}/posts/999`, () =>
      HttpResponse.json(failure('게시물을 찾을 수 없습니다'), { status: 404 }),
    ),
  );
}

describe('fetch — 404 를 성공으로 받는다', () => {
  it('reject 하지 않는다. catch 가 안 불린다', async () => {
    notFound();
    let caught = false;

    try {
      await fetch(`${API_BASE}/posts/999`);
    } catch {
      caught = true;
    }

    expect(caught).toBe(false);
  });

  it('갈리는 것은 ok 와 status 두 값이다', async () => {
    notFound();

    const response = await fetch(`${API_BASE}/posts/999`);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
  });

  it('본문을 읽는 데 await 이 한 번 더 필요하다', async () => {
    notFound();

    const response = await fetch(`${API_BASE}/posts/999`);
    const body = await response.json();

    expect(body).toEqual({ success: false, data: null, message: '게시물을 찾을 수 없습니다' });
  });

  it('연결 자체가 안 될 때만 reject 한다', async () => {
    server.use(http.get(`${API_BASE}/posts/999`, () => HttpResponse.error()));

    await expect(fetch(`${API_BASE}/posts/999`)).rejects.toThrow();
  });
});

describe('Axios — 같은 404 를 실패로 받는다', () => {
  it('reject 한다', async () => {
    notFound();

    await expect(axios.get(`${API_BASE}/posts/999`)).rejects.toBeInstanceOf(AxiosError);
  });

  it('던져진 것 안에 상태 번호와 서버가 보낸 봉투가 함께 들어 있다', async () => {
    notFound();

    const error = await axios.get(`${API_BASE}/posts/999`).catch((thrown: unknown) => thrown);

    expect(error).toBeInstanceOf(AxiosError);
    const axiosError = error as AxiosError<{ success: boolean; message: string }>;
    expect(axiosError.response?.status).toBe(404);
    expect(axiosError.response?.data.message).toBe('게시물을 찾을 수 없습니다');
  });

  it('성공한 응답은 body 를 이미 풀어서 준다 — await 한 번', async () => {
    const response = await axios.get(`${API_BASE}/posts`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data).toHaveLength(10);
  });

  it('실패로 볼 기준은 우리가 정할 수 있다', async () => {
    notFound();

    // 404 도 성공으로 받겠다고 하면 reject 하지 않는다
    const response = await axios.get(`${API_BASE}/posts/999`, {
      validateStatus: (status) => status < 500,
    });

    expect(response.status).toBe(404);
    expect(response.data.success).toBe(false);
  });

  it('기본 기준은 200 이상 300 미만이다', () => {
    const { validateStatus } = axios.defaults;

    expect(validateStatus?.(200)).toBe(true);
    expect(validateStatus?.(299)).toBe(true);
    expect(validateStatus?.(300)).toBe(false);
    expect(validateStatus?.(404)).toBe(false);
    expect(validateStatus?.(500)).toBe(false);
  });
});

describe('설치본 실물', () => {
  it('axios 는 1.19.0 이다', async () => {
    const pkg = await import('axios/package.json');

    expect(pkg.default.version).toBe('1.19.0');
  });
});
