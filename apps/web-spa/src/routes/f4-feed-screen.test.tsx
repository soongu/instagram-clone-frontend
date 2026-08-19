// apps/web-spa/src/routes/f4-feed-screen.test.tsx
// F-4 Step 5 — 서버가 끼는 화면. 기다리다가, 도착하고, 실패한다.
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/node';
import { MOCK_API_BASE, failure } from '../mocks/handlers';
import { withQuery } from '../../scratch/c5-query-harness';
import { withRouter } from '../../scratch/c1-router-harness';
import { HomePage } from './HomePage';
import { allPosts } from '../data/feed';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('서버가 끼는 화면은 세 얼굴을 가진다', () => {
  it('그리자마자 보이는 것은 기다리는 화면이다', () => {
    render(withQuery(withRouter(<HomePage />)));

    expect(screen.getByText('피드를 불러오는 중이에요…')).toBeInTheDocument();
  });

  it('★ 그 순간에는 카드가 없다 — getBy 로 찾으면 못 찾는다', () => {
    render(withQuery(withRouter(<HomePage />)));

    expect(() => screen.getAllByRole('article')).toThrow();
  });

  it('★ findBy 는 도착할 때까지 기다렸다가 찾아준다', async () => {
    render(withQuery(withRouter(<HomePage />)));

    expect(await screen.findAllByRole('article')).toHaveLength(allPosts.length);
  });

  it('도착한 뒤에는 기다리는 화면이 사라진다', async () => {
    render(withQuery(withRouter(<HomePage />)));
    await screen.findAllByRole('article');

    expect(screen.queryByText('피드를 불러오는 중이에요…')).not.toBeInTheDocument();
  });
});

describe('실패하는 화면', () => {
  it('서버가 사유를 보내면 화면이 카드를 안 그린다', async () => {
    server.use(
      http.get(`${MOCK_API_BASE}/posts`, () =>
        HttpResponse.json(failure('피드를 불러오지 못했습니다'), { status: 500 }),
      ),
    );

    render(withQuery(withRouter(<HomePage />)));

    // 실패는 위로 던져진다(C-6). 화면이 스스로 처리하지 않으므로
    // 카드가 영영 안 뜨는 것으로 확인한다.
    await expect(screen.findAllByRole('article', undefined, { timeout: 400 })).rejects.toThrow();
  });
});
