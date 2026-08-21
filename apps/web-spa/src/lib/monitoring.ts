// apps/web-spa/src/lib/monitoring.ts
import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import {
  createRoutesFromChildren,
  isRouteErrorResponse,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router';

// DSN 은 "어디로 보낼지" 하나만 정한다. 우리는 연습용 서비스를 우리 노트북에 띄워두고
// 그쪽을 가리킨다. 공개 키 자리는 서버가 확인하지 않지만 모양은 검사한다
// (영문·숫자·밑줄만 — 하이픈을 넣으면 SDK 가 DSN 을 통째로 버린다).
//
// 이 값은 브라우저로 그대로 실려 나간다. VITE_ 로 시작하는 값은 전부 그렇다.
// 그래서 DSN 은 비밀이 아니다 — 비밀이었다면 여기 두면 안 됐다.
const DSN = import.meta.env.VITE_SENTRY_DSN ?? 'http://demopublickey123@localhost:9000/7';

/**
 * 방문 몇 번에 한 번 속도를 보낼까.
 *
 * 1 은 전부 보낸다는 뜻이라 연습할 때만 쓴다. 봉투 하나가 수십 kB 라서
 * 사람이 많은 서비스가 이 값을 1 로 두면 우리 사용자의 데이터 요금과
 * 우리 요금이 함께 오른다. 실무에서는 0.1(열 번에 한 번)쯤에서 시작해
 * 숫자가 흔들리지 않을 만큼만 올린다.
 */
const TRACES_SAMPLE_RATE = 1;

export function startMonitoring(): void {
  Sentry.init({
    dsn: DSN,

    // 속도도 함께 본다. 우리 화면에서 재던 것을 이제 사용자에게서 모은다.
    tracesSampleRate: TRACES_SAMPLE_RATE,

    // 주소가 바뀌는 것을 라우터에게 물어보는 통합.
    // ⚠️ 이름에 버전이 붙은 것(...V7...)은 @deprecated 다. 접미사가 없는 이쪽이 후계이고
    //    "React Router v6+" 라고 적혀 있다 — 우리 8.3.0 에도 붙는다.
    integrations: [
      Sentry.reactRouterBrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],

    // 어느 환경에서 온 오류인지 갈라 볼 수 있게 표시해둔다.
    environment: import.meta.env.DEV ? 'development' : 'production',
  });
}

// 라우터가 잡아낸 오류를 보낼지 말지 여기서 정한다.
//
// 라우터는 두 가지를 같은 자리로 넘긴다. 코드가 터진 것과, 우리가 일부러 던진 Response 다.
// 앞엣것은 우리가 고쳐야 할 버그이고, 뒤엣것 중 404 는 고칠 것이 없다 —
// 없는 주소를 요청한 것뿐이라 보내봐야 진짜 버그를 덮는 잡음이 된다.
// 다른 번호(예: 500)는 서버 쪽에서 뭔가 잘못된 것이니 그대로 보낸다.
export function reportRouteError(error: unknown): void {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return;
  }

  Sentry.captureException(error);
}
