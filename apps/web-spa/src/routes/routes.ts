// apps/web-spa/src/routes/routes.ts
import type { RouteObject } from 'react-router';
import { HomePage } from './HomePage';
import { SignUpPage } from './SignUpPage';

// 주소와 화면을 짝지은 표. 라우터를 만드는 곳(main.tsx)과 떼어두면
// 어떤 주소가 있는지 이 파일 하나만 보면 된다.
export const routes: RouteObject[] = [
  { path: '/', Component: HomePage },
  { path: '/signup', Component: SignUpPage },
];
