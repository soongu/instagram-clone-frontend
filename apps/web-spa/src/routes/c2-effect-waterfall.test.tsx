// apps/web-spa/src/routes/c2-effect-waterfall.test.tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from './routes';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('C-2 Step 4 — 화면이 먼저 뜨고 데이터가 늦게 온다', () => {
  it('그린 직후에는 게시물이 아직 없다', async () => {
    renderAt('/p/1');

    expect(screen.queryByText('오늘 한강 노을이 미쳤다')).not.toBeInTheDocument();
    expect(screen.getByText(/불러오는 중/)).toBeInTheDocument();

    // 뒤늦게 도착하는 것까지 보고 끝낸다
    await screen.findByText('오늘 한강 노을이 미쳤다');
  });

  it('기다리면 그제서야 온다', async () => {
    renderAt('/p/1');

    expect(await screen.findByText('오늘 한강 노을이 미쳤다')).toBeInTheDocument();
    expect(screen.queryByText(/불러오는 중/)).not.toBeInTheDocument();
  });

  it('껍데기는 처음부터 있다 — 늦는 것은 알맹이뿐이다', async () => {
    renderAt('/p/1');

    expect(screen.getByRole('region', { name: '게시물' })).toBeInTheDocument();

    await screen.findByText('오늘 한강 노을이 미쳤다');
  });

  it('없는 번호도 기다린 뒤에야 못 찾았다는 것을 안다', async () => {
    renderAt('/p/999');

    expect(screen.queryByText(/찾을 수 없/)).not.toBeInTheDocument();
    expect(await screen.findByText(/찾을 수 없/)).toBeInTheDocument();
  });

  it('주소가 바뀌면 다시 불러온다', async () => {
    const router = renderAt('/p/1');
    await screen.findByText('오늘 한강 노을이 미쳤다');

    await router.navigate('/p/5');

    expect(await screen.findByText('제주 애월 바다 보이는 카페')).toBeInTheDocument();
    expect(screen.queryByText('오늘 한강 노을이 미쳤다')).not.toBeInTheDocument();
  });
});
