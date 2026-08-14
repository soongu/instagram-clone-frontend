// C-1 이후 화면을 통째로 그려보는 도우미 (내부 검증용)
//
// C-1 Step 5 에서 main·머리말이 Layout 으로 옮겨갔다.
// 페이지 컴포넌트만 홀로 그리면 그 껍데기가 안 나오므로,
// 껍데기까지 함께 보려면 라우터를 통해 그린다.
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from '../src/routes/routes';
import { withApp } from './c3-theme-harness';

export function pageMarkup(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });

  // C-3 Step 5 이후 밝기가 라우터 바깥에 있다 — 실제 main.tsx 와 같은 모양으로 그린다
  return renderToStaticMarkup(withApp(<RouterProvider router={router} />));
}

// C-2 Step 8 에서 HomePage 가 useSearchParams 를 쓰게 됐다.
// 라우터 훅은 문맥 없이는 못 돈다 — 홀로 그리던 판들에 문맥만 씌워준다.
// 화면에는 아무것도 안 더한다. Layout 도 안 딸려온다.
export function withRouter(ui: React.ReactNode) {
  return <MemoryRouter>{ui}</MemoryRouter>;
}
