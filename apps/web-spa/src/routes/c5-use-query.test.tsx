// apps/web-spa/src/routes/c5-use-query.test.tsx
// C-5 Step 6 — useQuery 로 넘어간 뒤 (내부 검증용)
//
// Step 1 에서 잰 것과 같은 지표로 잰다. 무엇이 사라졌는지 숫자로 보이게.
import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { HomePage } from './HomePage';
import { withRouter } from '../../scratch/c1-router-harness';
import { withQuery, freshQueryClient } from '../../scratch/c5-query-harness';
import {
  server,
  API_BASE,
  failure,
  feedHandler,
  requestLog,
  resetRequestLog,
} from '../../scratch/c5-server-harness';
import { allPosts } from '../data/feed';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => resetRequestLog());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('세 갈래는 그대로인데 손으로 든 것이 없다', () => {
  it('처음에는 기다리는 화면', () => {
    const html = renderToStaticMarkup(withQuery(withRouter(<HomePage />)));

    expect(html).toContain('피드를 불러오는 중이에요');
    expect(html.match(/<article data-slot="card"/g)).toBeNull();
  });

  it('응답이 오면 열 장이 뜬다', async () => {
    render(withQuery(withRouter(<HomePage />)));

    expect(await screen.findAllByRole('article')).toHaveLength(allPosts.length);
  });

  it('실패하면 서버가 보낸 사유가 뜬다', async () => {
    server.use(
      http.get(`${API_BASE}/posts`, () =>
        HttpResponse.json(failure('피드를 만들지 못했습니다'), { status: 500 }),
      ),
    );

    render(withQuery(withRouter(<HomePage />)));

    expect(await screen.findByText('피드를 만들지 못했습니다')).toBeInTheDocument();
  });

  it('화면에 useState 도 useEffect 도 없다', async () => {
    const source = await import('./HomePage.tsx?raw');

    expect(source.default).not.toMatch(/useState/);
    expect(source.default).not.toMatch(/useEffect/);
    expect(source.default).toMatch(/useFeedQuery/);
  });

  it('cancelled 표시로 늦은 응답을 막던 코드도 사라졌다', async () => {
    const source = await import('./HomePage.tsx?raw');
    const before = await import('../../scratch/c5-effect-fetch-before.tsx?raw');

    expect(before.default).toMatch(/cancelled/);
    expect(source.default).not.toMatch(/cancelled/);
  });
});

describe('Step 1 에서 아팠던 것을 같은 지표로 다시 잰다', () => {
  it('★ StrictMode 에서도 요청은 한 번이다 (Step 1 에서는 두 번)', async () => {
    render(<StrictMode>{withQuery(withRouter(<HomePage />))}</StrictMode>);

    await screen.findAllByRole('article');

    expect(requestLog.filter((line) => line === 'GET /api/posts')).toHaveLength(1);
  });

  it('★ 같은 피드를 두 곳에서 그려도 요청은 한 번이다 (Step 1 에서는 두 번)', async () => {
    const client = freshQueryClient();

    render(
      withQuery(
        <>
          {withRouter(<HomePage />)}
          {withRouter(<HomePage />)}
        </>,
        client,
      ),
    );

    expect(await screen.findAllByRole('article')).toHaveLength(allPosts.length * 2);
    expect(requestLog.filter((line) => line === 'GET /api/posts')).toHaveLength(1);
  });

  it('★ 나중에 도착한 데이터가 화면에 들어간다 (Step 1 의 초기값 함정이 사라졌다)', async () => {
    // 손으로 짜던 판에서는 부모가 useFeed(posts) 를 부르면 영영 빈 화면이었다.
    // 지금은 데이터가 온 뒤에 FeedSection 이 마운트되므로 그 함정을 안 만난다.
    render(withQuery(withRouter(<HomePage />)));

    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(await screen.findAllByRole('article')).toHaveLength(allPosts.length);
  });
});

describe('캐시가 화면 밖에서 값을 들고 있다', () => {
  it('★ 떠났다 돌아오면 기다리는 화면이 아예 안 뜬다', async () => {
    const client = freshQueryClient();

    const first = render(withQuery(withRouter(<HomePage />), client));
    await screen.findAllByRole('article');
    first.unmount();

    // 다시 열었다
    render(withQuery(withRouter(<HomePage />), client));

    // 기다림 없이 곧바로 카드가 있다
    expect(screen.getAllByRole('article')).toHaveLength(allPosts.length);
    expect(screen.queryByText('피드를 불러오는 중이에요…')).not.toBeInTheDocument();
  });

  it('캐시에는 우리가 준 키로 들어 있다', async () => {
    const client = freshQueryClient();

    render(withQuery(withRouter(<HomePage />), client));
    await screen.findAllByRole('article');

    const cached = client.getQueryData(['posts']);

    expect(cached).toHaveLength(allPosts.length);
  });

  it('★ 테스트마다 새 캐시를 만드는 이유 — 같은 캐시를 쓰면 요청이 안 나간다', async () => {
    const shared = freshQueryClient();

    const first = render(withQuery(withRouter(<HomePage />), shared));
    await screen.findAllByRole('article');
    first.unmount();
    resetRequestLog();

    server.use(feedHandler(allPosts.slice(0, 3)));
    render(withQuery(withRouter(<HomePage />), shared));

    // 받아둔 것이 있으니 그것을 먼저 보여준다 — 열 장 그대로
    expect(screen.getAllByRole('article')).toHaveLength(allPosts.length);
  });
});
