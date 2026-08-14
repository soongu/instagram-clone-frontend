import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { HomePageByEffect } from '../../scratch/c5-effect-fetch-before';
import { FeedSection } from '../components/FeedSection';
import { withRouter } from '../../scratch/c1-router-harness';
import { withQuery } from '../../scratch/c5-query-harness';
import { server, API_BASE, ok, failure, requestLog, resetRequestLog } from '../../scratch/c5-server-harness';
import { allPosts, feedPosts } from '../data/feed';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetRequestLog();
});
afterAll(() => server.close());

describe('직접 가져오는 판 — 화면이 세 갈래로 갈린다', () => {
  it('처음 뜨는 화면에는 게시물이 한 장도 없다', () => {
    const html = renderToStaticMarkup(withQuery(withRouter(<HomePageByEffect />)));

    expect(html).toContain('피드를 불러오는 중이에요');
    expect(html).not.toContain('jaehoon');
    expect(html.match(/<article data-slot="card"/g)).toBeNull();
  });

  it('응답이 오면 서버가 준 열 장이 뜬다', async () => {
    render(withQuery(withRouter(<HomePageByEffect />)));

    // 캡션은 열 글자에서 잘리므로(B-3) 글자 대신 카드로 기다린다
    expect(await screen.findAllByRole('article')).toHaveLength(allPosts.length);
    expect(screen.getAllByText('jaehoon').length).toBeGreaterThan(0);
  });

  it('봉투가 실패라고 말하면 그 사유를 화면에 띄운다', async () => {
    server.use(
      http.get(`${API_BASE}/posts`, () =>
        HttpResponse.json(failure('피드를 만들지 못했습니다'), { status: 500 }),
      ),
    );

    render(withQuery(withRouter(<HomePageByEffect />)));

    expect(await screen.findByText('피드를 만들지 못했습니다')).toBeInTheDocument();
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });

  it('연결 자체가 안 되면 우리가 쓴 말이 뜬다', async () => {
    server.use(http.get(`${API_BASE}/posts`, () => HttpResponse.error()));

    render(withQuery(withRouter(<HomePageByEffect />)));

    // Step 3 이후로는 이 말을 인스턴스가 만든다.
    // Axios 가 주는 'Network Error' 가 화면까지 오지 않는다.
    expect(await screen.findByText('서버에 연결할 수 없어요')).toBeInTheDocument();
  });
});

describe('직접 가져오는 판 — 요청이 몇 번 나가나', () => {
  it('StrictMode 에서는 화면 하나를 여는데 요청이 두 번 나간다', async () => {
    render(<StrictMode>{withQuery(withRouter(<HomePageByEffect />))}</StrictMode>);

    await screen.findAllByRole('article');

    expect(requestLog).toEqual(['GET /api/posts', 'GET /api/posts']);
  });

  it('같은 피드를 두 곳에서 그리면 요청도 두 번이다', async () => {
    render(
      <>
        {withQuery(withRouter(<HomePageByEffect />))}
        {withQuery(withRouter(<HomePageByEffect />))}
      </>,
    );

    expect(await screen.findAllByRole('article')).toHaveLength(allPosts.length * 2);

    expect(requestLog).toHaveLength(2);
  });
});

describe('가져온 뒤에 넘기는 자리 — 초기값은 한 번만 읽힌다', () => {
  it('FeedSection 은 마운트할 때 손에 쥔 배열로 화면을 채운다', () => {
    const html = renderToStaticMarkup(withQuery(withRouter(<FeedSection posts={feedPosts} />)));

    expect(html.match(/<article data-slot="card"/g)).toHaveLength(2);
    expect(html).toContain('좋아요 누른 게시물 1개');
  });

  it('나중에 도착한 배열을 다시 넘겨도 화면은 안 바뀐다', async () => {
    const { rerender } = render(withQuery(withRouter(<FeedSection posts={[]} />)));

    expect(screen.queryAllByRole('article')).toHaveLength(0);

    // 서버 응답이 늦게 도착한 상황을 흉내 낸다
    rerender(withQuery(withRouter(<FeedSection posts={allPosts} />)));

    // useReducer 의 초기값은 첫 렌더에서 한 번만 읽힌다
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });
});

describe('연습용 서버의 봉투 규약', () => {
  it('성공 봉투는 success·data·message 세 칸이다', async () => {
    const response = await fetch(`${API_BASE}/posts`);
    const body = await response.json();

    expect(Object.keys(body).sort()).toEqual(['data', 'message', 'success']);
    expect(body.success).toBe(true);
    expect(body.message).toBeNull();
    expect(body.data).toHaveLength(allPosts.length);
  });

  it('실패해도 200 이 아닌 상태 번호와 함께 같은 세 칸이 온다', async () => {
    server.use(
      http.get(`${API_BASE}/posts`, () => HttpResponse.json(failure('없습니다'), { status: 404 }),
      ),
    );

    const response = await fetch(`${API_BASE}/posts`);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ success: false, data: null, message: '없습니다' });
  });

  it('성공 봉투를 만드는 헬퍼는 message 를 null 로 채운다', () => {
    expect(ok([1, 2])).toEqual({ success: true, data: [1, 2], message: null });
  });
});
