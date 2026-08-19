// apps/web-spa/src/mocks/node.ts
//
// 테스트가 쓰는 쪽. 판이 도는 곳은 브라우저가 아니라 Node 라서
// 서비스 워커가 아니라 Node 의 요청 계층을 직접 가로챈다.
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
