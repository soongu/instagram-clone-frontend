// apps/web-spa/src/routes/c5-query-key.test.tsx
// C-5 Step 7 — 키가 캐시의 주소다 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { ExplorePage } from './ExplorePage';
import { feedKey, tagsKey } from '../queries/posts';
import { fetchFeed } from '../api/posts';
import { withQuery, freshQueryClient } from '../../scratch/c5-query-harness';
import { FixedKeyExplore } from '../../scratch/c5-fixed-key-probe';
import { server, requestLog, resetRequestLog } from '../../scratch/c5-server-harness';
import { allPosts } from '../data/feed';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => resetRequestLog());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const CAFE_COUNT = allPosts.filter((post) => post.hashtagNames.includes('카페')).length;
const HANGANG_COUNT = allPosts.filter((post) => post.hashtagNames.includes('한강')).length;

function renderExplore(client = freshQueryClient(), path = '/explore') {
  render(
    withQuery(
      <MemoryRouter initialEntries={[path]}>
        <ExplorePage />
      </MemoryRouter>,
      client,
    ),
  );

  return client;
}

function shownImages() {
  return screen.queryAllByRole('img');
}

describe('키 만들기', () => {
  it('태그가 없으면 이름 하나, 있으면 이름과 조건이 함께 들어간다', () => {
    expect(feedKey()).toEqual(['posts']);
    expect(feedKey('카페')).toEqual(['posts', { tag: '카페' }]);
    expect(tagsKey).toEqual(['tags']);
  });

  it('같은 태그면 같은 키가 나온다 — 캐시가 찾을 수 있게', () => {
    expect(feedKey('카페')).toEqual(feedKey('카페'));
    expect(feedKey('카페')).not.toEqual(feedKey('한강'));
  });
});

describe('주소에 적힌 태그가 그대로 요청이 된다', () => {
  it('태그 없이 들어오면 열 장이 온다', async () => {
    renderExplore();

    expect(await screen.findAllByRole('img')).toHaveLength(allPosts.length);
    expect(requestLog).toContain('GET /api/posts');
  });

  it('주소에 태그가 있으면 그것만 온다 — 걸러내기를 서버가 한다', async () => {
    renderExplore(freshQueryClient(), '/explore?tag=카페');

    expect(await screen.findAllByRole('img')).toHaveLength(CAFE_COUNT);
    expect(requestLog).toContain('GET /api/posts?tag=카페');
  });

  it('한글 태그도 그대로 실려 간다 — Axios 가 인코딩한다', async () => {
    const posts = await fetchFeed('제주도');

    expect(posts.every((post) => post.hashtagNames.includes('제주도'))).toBe(true);
  });

  it('없는 태그면 빈 목록과 안내 문구가 뜬다', async () => {
    renderExplore(freshQueryClient(), '/explore?tag=없는태그');

    expect(await screen.findByText('이 태그를 붙인 게시물이 없습니다.')).toBeInTheDocument();
    expect(shownImages()).toHaveLength(0);
  });
});

describe('키가 바뀌면 새로 물어보고, 돌아오면 캐시에서 꺼낸다', () => {
  it('★ 태그를 누를 때마다 요청이 하나씩 늘어난다', async () => {
    const user = userEvent.setup();
    renderExplore();
    await screen.findAllByRole('img');

    await user.click(screen.getByRole('button', { name: '카페' }));
    expect(await screen.findAllByRole('img')).toHaveLength(CAFE_COUNT);

    await user.click(screen.getByRole('button', { name: '한강' }));
    expect(await screen.findAllByRole('img')).toHaveLength(HANGANG_COUNT);

    expect(requestLog.filter((line) => line.startsWith('GET /api/posts'))).toEqual([
      'GET /api/posts',
      'GET /api/posts?tag=카페',
      'GET /api/posts?tag=한강',
    ]);
  });

  it('★ 이미 본 태그로 되돌아가면 기다림 없이 곧바로 채워진다', async () => {
    const user = userEvent.setup();
    renderExplore();
    await screen.findAllByRole('img');

    await user.click(screen.getByRole('button', { name: '카페' }));
    await screen.findAllByRole('img');
    resetRequestLog();

    await user.click(screen.getByRole('button', { name: '전체' }));
    await screen.findAllByRole('img');
    await user.click(screen.getByRole('button', { name: '카페' }));

    // 물어보러 가는 동안에도 '불러오는 중' 이 안 뜬다. 받아둔 것을 먼저 보여준다.
    expect(screen.queryByText('게시물을 불러오는 중이에요…')).not.toBeInTheDocument();
    expect(shownImages()).toHaveLength(CAFE_COUNT);
  });

  it('★ 그런데 요청은 다시 나간다 — 받아둔 것을 기본값이 이미 낡았다고 본다', async () => {
    const user = userEvent.setup();
    renderExplore();
    await screen.findAllByRole('img');

    await user.click(screen.getByRole('button', { name: '카페' }));
    await screen.findAllByRole('img');
    resetRequestLog();

    await user.click(screen.getByRole('button', { name: '전체' }));
    await screen.findAllByRole('img');
    await user.click(screen.getByRole('button', { name: '카페' }));
    await screen.findAllByRole('img');

    // 화면은 즉시 채워졌지만 조용히 다시 물어본다 (staleTime 기본값 0 — Step 8)
    expect(requestLog.filter((line) => line.startsWith('GET /api/posts'))).toEqual([
      'GET /api/posts',
      'GET /api/posts?tag=카페',
    ]);
  });

  it('태그 목록은 게시물과 다른 키라서 태그를 바꿔도 다시 안 부른다', async () => {
    const user = userEvent.setup();
    renderExplore();
    await screen.findAllByRole('img');

    await user.click(screen.getByRole('button', { name: '카페' }));
    await screen.findAllByRole('img');

    expect(requestLog.filter((line) => line === 'GET /api/tags')).toHaveLength(1);
  });

  it('캐시에 태그별로 따로 들어 있다', async () => {
    const user = userEvent.setup();
    const client = renderExplore();
    await screen.findAllByRole('img');

    await user.click(screen.getByRole('button', { name: '카페' }));
    await screen.findAllByRole('img');

    expect(client.getQueryData(feedKey())).toHaveLength(allPosts.length);
    expect(client.getQueryData(feedKey('카페'))).toHaveLength(CAFE_COUNT);
    expect(client.getQueryData(feedKey('한강'))).toBeUndefined();
  });
});

describe('반례 — 키에 태그를 안 넣으면', () => {
  it('★ 태그가 달라도 캐시는 같은 것으로 보고 앞의 결과를 그대로 준다', async () => {
    const client = freshQueryClient();

    // 먼저 전체를 받아 캐시에 넣는다
    const all = render(
      withQuery(
        <MemoryRouter initialEntries={['/explore']}>
          <FixedKeyExplore />
        </MemoryRouter>,
        client,
      ),
    );
    expect(await screen.findAllByRole('listitem')).toHaveLength(allPosts.length);
    all.unmount();
    resetRequestLog();

    // 이번엔 태그를 달고 들어왔는데 키는 그대로다
    render(
      withQuery(
        <MemoryRouter initialEntries={['/explore?tag=카페']}>
          <FixedKeyExplore />
        </MemoryRouter>,
        client,
      ),
    );

    // 카페는 네 장인데 열 장이 그대로 떠 있다
    expect(screen.getAllByRole('listitem')).toHaveLength(allPosts.length);
    expect(CAFE_COUNT).toBeLessThan(allPosts.length);
  });
});
