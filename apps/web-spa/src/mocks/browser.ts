// apps/web-spa/src/mocks/browser.ts
//
// 브라우저가 쓰는 쪽. 판이 쓰는 node.ts 와 핸들러 목록이 같다 — 한 벌을 둘이 나눠 쓴다.
//
// 다른 것은 가로채는 방법뿐이다. Node 에서는 요청 계층을 직접 패치했지만
// 브라우저에서는 그럴 수 없어서, 서비스 워커가 나가는 요청을 가로챈다.
// public/mockServiceWorker.js 가 그 워커이고 `npx msw init public/` 이 갖다 놓는다.
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
