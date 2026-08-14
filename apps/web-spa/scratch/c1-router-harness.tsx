// C-1 이후 화면을 통째로 그려보는 도우미 (내부 검증용)
//
// C-1 Step 5 에서 main·머리말이 Layout 으로 옮겨갔다.
// 페이지 컴포넌트만 홀로 그리면 그 껍데기가 안 나오므로,
// 껍데기까지 함께 보려면 라우터를 통해 그린다.
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, createMemoryRouter, RouterProvider } from 'react-router';
import type { RouteObject } from 'react-router';
import { routes } from '../src/routes/routes';
import { FeedSection } from '../src/components/FeedSection';
import { feedPosts } from '../src/data/feed';
import type { Post } from '../src/types/instagram';
import { withApp } from './c3-theme-harness';

export function pageMarkup(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });

  // C-3 Step 5 이후 밝기가 라우터 바깥에 있다 — 실제 main.tsx 와 같은 모양으로 그린다
  return renderToStaticMarkup(withApp(<RouterProvider router={router} />));
}

// C-5 Step 1 이후 홈이 서버에 물어본다. 그래서 홈은 더 이상 즉시 그려지지 않는다.
//
// 라우팅·모달·store 를 보던 판들은 "피드가 있는 홈" 을 전제로 서 있었다.
// 그 판들이 네트워크까지 함께 재게 만드는 대신, 게시물을 이미 손에 쥔
// 홈으로 바꿔 끼운 라우트 표를 준다. 보던 것(주소·껍데기·모달)은 그대로다.
export function routesWithFeed(posts: Post[] = feedPosts): RouteObject[] {
  function FeedHome() {
    return <FeedSection posts={posts} />;
  }

  return routes.map((route) => {
    if (route.index === true || route.children === undefined) {
      return route;
    }

    const children = route.children.map((child) =>
      child.index === true ? { ...child, Component: FeedHome } : child,
    );

    return { ...route, children };
  });
}

// 껍데기와 피드를 함께 정적으로 봐야 하는 판을 위해, 게시물이 이미 도착한 홈을 그린다.
export function homeMarkup(posts: Post[] = feedPosts) {
  const router = createMemoryRouter(routesWithFeed(posts), { initialEntries: ['/'] });

  return renderToStaticMarkup(withApp(<RouterProvider router={router} />));
}

// C-2 Step 8 에서 HomePage 가 useSearchParams 를 쓰게 됐다.
// 라우터 훅은 문맥 없이는 못 돈다 — 홀로 그리던 판들에 문맥만 씌워준다.
// 화면에는 아무것도 안 더한다. Layout 도 안 딸려온다.
export function withRouter(ui: React.ReactNode) {
  return <MemoryRouter>{ui}</MemoryRouter>;
}
