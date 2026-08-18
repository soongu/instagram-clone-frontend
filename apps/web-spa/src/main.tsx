// apps/web-spa/src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppProviders } from './AppProviders';
import { closeConfirmOnNavigate } from './lib/closeConfirmOnNavigate';
import { RealtimeBridge } from './realtime/RealtimeBridge';
import { routes } from './routes/routes';
import './styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('#root 를 찾지 못했습니다');
}

// 라우터는 React 바깥에서 딱 한 번 만든다.
// 컴포넌트 안에서 만들면 다시 그려질 때마다 새 라우터가 생겨 주소 기록이 끊긴다.
const router = createBrowserRouter(routes);

// 라우터도 store 도 React 바깥에 있다. 둘을 잇는 이 줄도 컴포넌트가 아니다.
closeConfirmOnNavigate(router);

// 밝기는 라우터보다 바깥에 있다. 어느 주소로 들어오든, 오류 화면이 떠도 그대로다.
createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      {/* 통로도 라우터·캐시와 같은 자리다. 앱에 한 번만 열고, 어느 화면에 있든 열려 있다.
          캐시에 얹어야 하니 AppProviders 안쪽이어야 한다. */}
      <RealtimeBridge />
      <RouterProvider router={router} />
      {/* 창고를 들여다보는 창. 개발할 때만 붙고 배포본에는 안 들어간다.
          AppProviders 안쪽이어야 같은 캐시를 본다. */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </AppProviders>
  </StrictMode>,
);
