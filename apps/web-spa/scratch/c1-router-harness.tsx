// C-1 이후 화면을 통째로 그려보는 도우미 (내부 검증용)
//
// C-1 Step 5 에서 main·머리말이 Layout 으로 옮겨갔다.
// 페이지 컴포넌트만 홀로 그리면 그 껍데기가 안 나오므로,
// 껍데기까지 함께 보려면 라우터를 통해 그린다.
import { renderToStaticMarkup } from 'react-dom/server';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from '../src/routes/routes';

export function pageMarkup(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });

  return renderToStaticMarkup(<RouterProvider router={router} />);
}
