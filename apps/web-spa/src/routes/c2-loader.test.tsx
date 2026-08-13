// apps/web-spa/src/routes/c2-loader.test.tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from './routes';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('C-2 Step 5 — 뜨기 전에 부른다', () => {
  it('상세가 뜨는 순간 이미 알맹이가 들어 있다', async () => {
    renderAt('/p/1');

    const region = await screen.findByRole('region', { name: '게시물' });

    // Step 4 에서는 이 구역이 먼저 뜨고 안이 비어 있었다
    expect(within(region).getByText('오늘 한강 노을이 미쳤다')).toBeInTheDocument();
    expect(within(region).getByText('jaehoon')).toBeInTheDocument();
  });

  it('껍데기만 먼저 뜨는 순간이 없다', () => {
    renderAt('/p/1');

    // 아직 loader 가 도는 중 — 반쯤 그려진 화면을 아예 안 만든다
    expect(screen.queryByRole('region', { name: '게시물' })).not.toBeInTheDocument();
    expect(screen.queryByText(/불러오는 중/)).not.toBeInTheDocument();
  });

  it('가는 중에는 앞 화면이 그대로 남아 있다', async () => {
    renderAt('/explore');
    await screen.findByRole('list', { name: '탐색 목록' });

    const [firstLink] = screen.getAllByRole('link', { name: /의 게시물$/ });
    await userEvent.click(firstLink);

    // 눌렀는데 화면이 비지 않는다 — 아직 앞 화면이다
    expect(screen.getByRole('list', { name: '탐색 목록' })).toBeInTheDocument();

    // 다 불러오면 그제서야 통째로 갈린다
    expect(await screen.findByRole('region', { name: '게시물' })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: '탐색 목록' })).not.toBeInTheDocument();
  });

  it('주소가 바뀌면 loader 가 다시 돈다', async () => {
    const router = renderAt('/p/1');
    await screen.findByText('오늘 한강 노을이 미쳤다');

    await router.navigate('/p/5');

    expect(await screen.findByText('제주 애월 바다 보이는 카페')).toBeInTheDocument();
    expect(screen.queryByText('오늘 한강 노을이 미쳤다')).not.toBeInTheDocument();
  });

  it('없는 번호는 여전히 못 찾았다고 알린다', async () => {
    renderAt('/p/999');

    expect(await screen.findByText(/찾을 수 없/)).toBeInTheDocument();
  });
});

describe('C-2 Step 5 — 부르는 자리가 옮겨간 흔적', () => {
  it('상세 화면에서 effect 와 상태가 사라졌다', async () => {
    const source = await import('./PostDetailPage.tsx?raw');

    expect(source.default).not.toMatch(/useEffect/);
    expect(source.default).not.toMatch(/useState/);
    expect(source.default).toMatch(/useLoaderData/);
  });

  it('useLoaderData 에 무엇을 담았는지 알려준다 — 안 알려주면 any 다', async () => {
    const source = await import('./PostDetailPage.tsx?raw');

    expect(source.default).toMatch(/useLoaderData<typeof postLoader>\(\)/);
  });

  it('주소 표의 그 줄이 loader 를 들고 있다', async () => {
    const source = await import('./routes.ts?raw');

    expect(source.default).toMatch(/loader: postLoader/);
  });
});
