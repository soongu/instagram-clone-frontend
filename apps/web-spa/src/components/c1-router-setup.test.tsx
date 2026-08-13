// apps/web-spa/src/components/c1-router-setup.test.tsx
import { RouterProvider as BaseRouterProvider } from 'react-router';
import { RouterProvider as DomRouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';
import mainSource from '../main.tsx?raw';

// 주소별로 무엇이 그려지는지는 Step 4 의 c1-routes-split 이 본다.
// 여기서는 라우터를 세우는 방식만 못 박는다.

describe('C-1 Step 3 — 같은 이름이 둘이다', () => {
  it('react-router 와 react-router/dom 의 RouterProvider 는 서로 다른 함수다', () => {
    expect(typeof BaseRouterProvider).toBe('function');
    expect(typeof DomRouterProvider).toBe('function');
    expect(DomRouterProvider).not.toBe(BaseRouterProvider);
  });

  // 둘 다 있어서 잘못 가져와도 tsc 가 안 잡는다. 그래서 소스로 못 박는다.
  it('main.tsx 는 RouterProvider 를 react-router/dom 에서 가져온다', () => {
    expect(mainSource).toMatch(/import \{ RouterProvider \} from 'react-router\/dom';/);
    // createBrowserRouter 는 반대로 react-router 쪽이다
    expect(mainSource).toMatch(/import \{ createBrowserRouter \} from 'react-router';/);
  });

  it('없어진 패키지 이름은 어디에도 없다', () => {
    expect(mainSource).not.toMatch(/react-router-dom/);
  });
});

describe('C-1 Step 3 — 라우터는 React 바깥에서 한 번만', () => {
  it('createBrowserRouter 가 createRoot 보다 먼저 불린다', () => {
    const routerAt = mainSource.indexOf('createBrowserRouter(');
    const renderAt = mainSource.indexOf('createRoot(');

    expect(routerAt).toBeGreaterThan(-1);
    expect(routerAt).toBeLessThan(renderAt);
  });

  it('라우터를 컴포넌트 안에서 만들지 않는다', () => {
    // 최상위(들여쓰기 0)에서 불려야 한다 — 컴포넌트 안이면 앞에 공백이 붙는다
    expect(mainSource).toMatch(/^const router = createBrowserRouter\(/m);
  });
});
