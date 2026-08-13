// apps/web-spa/src/routes/routes.ts
import type { RouteObject } from 'react-router';
import { Layout } from './Layout';
import { HomePage } from './HomePage';
import { SignUpPage } from './SignUpPage';
import { PostDetailPage } from './PostDetailPage';

// 부모가 껍데기(Layout)를 맡고, 자식이 Outlet 자리에 들어간다.
// 자식 주소는 앞에 빗금을 안 붙인다 — 부모 주소에 이어 붙기 때문이다.
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'signup', Component: SignUpPage },
      // 콜론이 붙은 칸은 고정된 글자가 아니라 자리다.
      // 게시물이 백만 개여도 이 표는 한 줄이면 된다.
      { path: 'p/:postId', Component: PostDetailPage },
    ],
  },
];
