// apps/web-spa/src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as Sentry from '@sentry/react';
import { AppProviders } from './AppProviders';
import { closeConfirmOnNavigate } from './lib/closeConfirmOnNavigate';
import { startMonitoring } from './lib/monitoring';
import {
  countFeedImages,
  observeVitals,
  onFeedImagesSettled,
  type VitalsReport,
} from './lib/h3-vitals';
import { RealtimeBridge } from './realtime/RealtimeBridge';
import { routes } from './routes/routes';
import './styles/globals.css';

// 오류를 알아채는 일은 앱에서 가장 먼저 켠다.
// 늦게 켜면 그 전에 터진 것은 아무도 못 본다.
startMonitoring();

// 재는 일도 그리기 전에 켠다. 늦게 켜면 그 전에 그려진 것은 못 본다.
//
// 개발 서버에서만 켜지 않는다. 사용자가 받는 것은 빌드된 배포본이고,
// 개발 서버의 숫자는 그것과 다르기 때문이다 — 재려면 배포본에서 재야 한다.
// 지금은 우리 콘솔로만 본다. 이 숫자를 실제 사용자에게서 모으는 것은 다음 시간에 한다.
let latest: VitalsReport = { lcp: 0, lcpElement: null, cls: 0, shifts: [] };

function printVitals(label: string, withSources = false) {
  const images = countFeedImages();
  console.log(
    `[성능] ${label} — LCP ${Math.round(latest.lcp)}ms · CLS ${latest.cls.toFixed(4)}` +
      ` · 사진 ${images.loaded}/${images.total}` +
      (images.allLoaded ? '' : ' ⚠️ 아직 다 안 왔어요'),
  );

  // ⚠️ 여기 찍히는 것은 '민 것' 이 아니라 '밀린 것' 이다.
  //    밀어낸 쪽은 자기 자리에서 자랐을 뿐이라 움직이지 않았고, 그래서 목록에 안 나온다.
  //    고칠 데를 찾으려면 이 목록을 보고 "이것들 바로 위에 무엇이 있나" 를 거슬러 올라가야 한다.
  if (withSources) {
    for (const shift of latest.shifts) {
      console.log(`         ↳ ${shift.value.toFixed(4)} 밀렸다 · ${shift.sources.join(', ')}`);
    }
  }
}

observeVitals((report) => {
  latest = report;
  printVitals('재는 중');
});

// 사진이 다 도착하는 순간. 밀림을 고치고 나면 관찰자가 안 울기 때문에
// 이 줄이 없으면 "다 왔는데 안 밀렸다" 를 확인할 자리가 없다.
onFeedImagesSettled(() => printVitals('사진 다 옴', true));

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('#root 를 찾지 못했습니다');
}

// 라우터는 React 바깥에서 딱 한 번 만든다.
// 컴포넌트 안에서 만들면 다시 그려질 때마다 새 라우터가 생겨 주소 기록이 끊긴다.
const router = createBrowserRouter(routes);

// 라우터도 store 도 React 바깥에 있다. 둘을 잇는 이 줄도 컴포넌트가 아니다.
closeConfirmOnNavigate(router);

// 연습용 서버 없이 화면을 보고 싶을 때만 흉내 서버를 켠다.
//
//   VITE_MOCK_API=1 npm run dev
//
// import() 를 여기서 부르는 이유가 둘이다. 하나는 배포본에 안 들어가게 하는 것이고,
// 다른 하나는 워커가 다 켜진 뒤에 화면을 그려야 첫 요청부터 가로채지기 때문이다.
async function startMockingIfAsked(): Promise<void> {
  if (!import.meta.env.DEV || import.meta.env.VITE_MOCK_API !== '1') {
    return;
  }

  const { worker } = await import('./mocks/browser');

  await worker.start({ onUnhandledRequest: 'warn' });
}

// 밝기는 라우터보다 바깥에 있다. 어느 주소로 들어오든, 오류 화면이 떠도 그대로다.
void startMockingIfAsked().then(() => {
  // 라우터가 오류를 잡으면 화면은 멀쩡히 바뀌지만 밖으로는 아무것도 안 나간다.
  // React 가 "경계가 잡았다" 고 알려주는 이 자리에서 넘겨줘야 우리가 알게 된다.
  createRoot(rootElement, {
    onCaughtError: Sentry.reactErrorHandler(),
    onUncaughtError: Sentry.reactErrorHandler(),
  }).render(
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
});
