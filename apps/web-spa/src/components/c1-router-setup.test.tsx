// apps/web-spa/src/components/c1-router-setup.test.tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider as BaseRouterProvider } from 'react-router';
import { RouterProvider as DomRouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';
import { App } from '../App';
import mainSource from '../main.tsx?raw';

describe('C-1 Step 3 — 라우터를 세운다', () => {
  it('/ 에 App 을 걸면 피드가 그려진다', () => {
    const router = createMemoryRouter([{ path: '/', Component: App }], {
      initialEntries: ['/'],
    });

    render(<BaseRouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: '인스타그램', level: 1 })).toBeInTheDocument();
  });

  it('없는 주소로 들어가면 App 이 안 그려진다', () => {
    const router = createMemoryRouter([{ path: '/', Component: App }], {
      initialEntries: ['/없는주소'],
    });

    render(<BaseRouterProvider router={router} />);

    expect(screen.queryByRole('heading', { name: '인스타그램', level: 1 })).not.toBeInTheDocument();
  });
});

describe('C-1 Step 3 — 같은 이름이 둘이다', () => {
  it('react-router 와 react-router/dom 의 RouterProvider 는 서로 다른 함수다', () => {
    expect(typeof BaseRouterProvider).toBe('function');
    expect(typeof DomRouterProvider).toBe('function');
    expect(DomRouterProvider).not.toBe(BaseRouterProvider);
  });

  it('main.tsx 는 RouterProvider 를 react-router/dom 에서 가져온다', () => {
    const source = mainSource;

    expect(source).toMatch(/import \{ RouterProvider \} from 'react-router\/dom';/);
    // createBrowserRouter 는 반대로 react-router 쪽이다
    expect(source).toMatch(/import \{ createBrowserRouter \} from 'react-router';/);
  });

  it('라우터는 React 바깥에서 한 번만 만든다', () => {
    const source = mainSource;
    const routerLine = source.indexOf('createBrowserRouter(');
    const renderLine = source.indexOf('createRoot(');

    expect(routerLine).toBeGreaterThan(-1);
    expect(routerLine).toBeLessThan(renderLine);
  });
});
