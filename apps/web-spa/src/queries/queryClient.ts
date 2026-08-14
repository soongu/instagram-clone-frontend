// apps/web-spa/src/queries/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

// 받아둔 값을 얼마 동안 "쓸 만하다" 고 볼지.
// 이 시간 안에는 다시 물어보지 않는다.
const STALE_TIME_MS = 30_000;

// 아무도 안 보는 값을 얼마 동안 캐시에 남겨둘지.
// 이 시간이 지나면 캐시에서 지워진다 — 다시 열면 처음부터다.
const GC_TIME_MS = 5 * 60_000;

// 캐시를 들고 있는 사람. React 바깥에서 한 번 만든다.
// 컴포넌트 안에서 만들면 다시 그려질 때마다 캐시가 새로 생긴다
// (main.tsx 의 라우터와 같은 이유다).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS,

      // 읽다가 실패하면 화면에서 처리하지 말고 위로 던진다.
      // 라우트마다 세워둔 ErrorBoundary 가 그것을 받는다.
      // 쓰기(뮤테이션)는 이 값을 안 따른다 — 실패해도 그 자리에서 알려야 한다.
      throwOnError: true,
    },
  },
});
