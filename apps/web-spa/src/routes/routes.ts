// apps/web-spa/src/routes/routes.ts
import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import { Layout } from './Layout';
import { HomePage } from './HomePage';
// 회원가입은 처음 오는 사람만 본다. 피드를 보러 온 사람에게까지
// 이 화면의 코드를 내려보낼 이유가 없다.
// 이름 붙은 내보내기라 default 로 갈아 끼워 건넨다.
const SignUpPage = lazy(() =>
  import('./SignUpPage').then((module) => ({ default: module.SignUpPage })),
);
import { PostDetailPage } from './PostDetailPage';
import { ExplorePage } from './ExplorePage';
import { postLoader } from './postLoader';
import { RootErrorBoundary } from './RootErrorBoundary';
import { NotFoundPage } from './NotFoundPage';

// 부모가 껍데기(Layout)를 맡고, 자식이 Outlet 자리에 들어간다.
// 자식 주소는 앞에 빗금을 안 붙인다 — 부모 주소에 이어 붙기 때문이다.
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: Layout,
    // Component 와 짝을 이룬다. 아래에서 무엇이 던져지든 여기로 올라온다.
    ErrorBoundary: RootErrorBoundary,
    children: [
      { index: true, Component: HomePage },
      { path: 'signup', Component: SignUpPage },
      { path: 'explore', Component: ExplorePage },
      // 콜론이 붙은 칸은 고정된 글자가 아니라 자리다.
      // 게시물이 백만 개여도 이 표는 한 줄이면 된다.
      // loader 는 Component 와 나란히 선다. 라우터가 loader 를 먼저 부르고,
      // 그것이 끝난 뒤에야 Component 를 그린다.
      { path: 'p/:postId', loader: postLoader, Component: PostDetailPage },
      // 별표는 아무도 안 맡은 주소를 받는다. 맨 끝에 둬야 위의 주소들을 안 가로챈다.
      { path: '*', Component: NotFoundPage },
    ],
  },
];
