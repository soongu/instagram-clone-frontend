import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import {
  AuthorName,
  ErrorBoundaryWithToggle,
  SessionProvider,
  useSession,
  AnswerAppProviders,
} from '../../scratch/c3-story-answer';
import { ThemeToggle } from './ThemeToggle';
import { withApp } from '../../scratch/c3-theme-harness';
import { THEME_COLOR, THEME_STORAGE_KEY } from '../lib/theme';

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove('dark');
  document.head.querySelector('meta[name="theme-color"]')?.remove();

  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = THEME_COLOR.light;
  document.head.append(meta);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// 과제 [구현] 예시답안 채증 — 로그인한 사용자를 Context 로
describe('과제 1 — 로그인한 사용자를 Context 로', () => {
  it('내 게시물이면 표시가 붙는다', () => {
    render(
      <SessionProvider>
        <AuthorName username="jaehoon" />
      </SessionProvider>,
    );

    expect(screen.getByText('내 게시물')).toBeInTheDocument();
  });

  it('남의 게시물이면 안 붙는다', () => {
    render(
      <SessionProvider>
        <AuthorName username="minji" />
      </SessionProvider>,
    );

    expect(screen.getByText('minji')).toBeInTheDocument();
    expect(screen.queryByText('내 게시물')).toBeNull();
  });

  it('AuthorName 이 받는 props 는 작성자 하나뿐이다 — 내가 누구인지는 위에서 온다', () => {
    // props 로 세션을 안 넘겼는데도 판별이 된다는 것이 이 과제의 핵심이다
    render(
      <SessionProvider>
        <div>
          <div>
            <AuthorName username="jaehoon" />
          </div>
        </div>
      </SessionProvider>,
    );

    expect(screen.getByText('내 게시물')).toBeInTheDocument();
  });

  it('Provider 를 잊으면 그 자리에서 멈춘다 — 밝기 쪽과 같은 규약', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    function Bare() {
      useSession();
      return null;
    }

    expect(() => render(<Bare />)).toThrow(
      'useSession 은 SessionProvider 안에서 불러야 합니다',
    );
  });
});

// 과제 [구현] 예시답안 채증 — 오류 화면에도 밝기 버튼 달기
describe('과제 2 — 오류 화면에도 밝기 버튼', () => {
  function renderErrorScreen() {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          // 우리 앱과 같은 모양 — loader 가 던지고 ErrorBoundary 가 받는다
          loader: () => {
            throw new Response('게시물을 찾을 수 없습니다', { status: 404 });
          },
          Component: () => <p>여기는 안 그려진다</p>,
          ErrorBoundary: ErrorBoundaryWithToggle,
        },
      ],
      { initialEntries: ['/'] },
    );

    render(withApp(<RouterProvider router={router} />));
  }

  it('던져진 화면에서도 밝기를 고를 수 있다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();

    renderErrorScreen();

    expect(await screen.findByText('없는 페이지예요')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '어둡게' }));

    expect(document.documentElement).toHaveClass('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('오류 화면에서 고른 것도 주소창 색까지 닿는다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();

    renderErrorScreen();

    await screen.findByText('없는 페이지예요');
    await user.click(screen.getByRole('button', { name: '어둡게' }));

    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(
      THEME_COLOR.dark,
    );
  });
});

// 과제 1 — AppProviders 에 두 Provider 를 나란히 두는 모양이 실제로 도는가
describe('과제 1 — AppProviders 중첩', () => {
  it('밝기와 세션을 함께 감싸도 둘 다 정상이다', async () => {
    const user = userEvent.setup();

    render(
      <AnswerAppProviders>
        <ThemeToggle />
        <AuthorName username="jaehoon" />
      </AnswerAppProviders>,
    );

    expect(screen.getByText('내 게시물')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '어둡게' }));

    expect(document.documentElement).toHaveClass('dark');
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(
      THEME_COLOR.dark,
    );
    // 밝기를 바꿔도 세션은 그대로다
    expect(screen.getByText('내 게시물')).toBeInTheDocument();
  });
});
