// apps/web-spa/src/routes/routes.ts
import type { RouteObject } from 'react-router';
import { Layout } from './Layout';
import { HomePage } from './HomePage';
import { SignUpPage } from './SignUpPage';

// 부모가 껍데기(Layout)를 맡고, 자식이 Outlet 자리에 들어간다.
// 자식 주소는 앞에 빗금을 안 붙인다 — 부모 주소에 이어 붙기 때문이다.
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'signup', Component: SignUpPage },
    ],
  },
];
