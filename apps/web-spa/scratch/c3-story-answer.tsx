// C-3 과제 예시답안 보존 (내부 검증용)
//
// 교안 과제의 풀이를 실제로 컴파일·동작시켜 보기 위한 판이다.
// 학생 코드베이스에는 이것이 src/ 아래에 들어가지만,
// 우리 코드베이스는 Step 6 종료 상태를 유지해야 하므로 여기에 둔다.
import { createContext, useContext, useState, type ReactNode } from 'react';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router';
import { ThemeToggle } from '../src/components/ThemeToggle';
import { ThemeColorMeta } from '../src/components/ThemeColorMeta';
import { ThemeProvider } from '../src/contexts/ThemeContext';

// ── 과제 1: 로그인한 사용자를 Context 로 ──────────────────────────────

export interface Session {
  username: string;
  displayName: string;
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  // 서버가 붙기 전까지는 고정값 하나로 시작한다.
  // useState 로 둔 이유는 나중에 로그인·로그아웃이 생길 자리를 비워두기 위해서다.
  const [session] = useState<Session>({ username: 'jaehoon', displayName: '이재훈' });

  return <SessionContext value={session}>{children}</SessionContext>;
}

export function useSession() {
  const value = useContext(SessionContext);

  if (value === null) {
    throw new Error('useSession 은 SessionProvider 안에서 불러야 합니다');
  }

  return value;
}

// 캡션 앞의 사용자 이름. 내 게시물이면 표시를 하나 더 붙인다.
// props 로 받는 것은 게시물 작성자뿐이다 — 내가 누구인지는 위에서 꺼내 온다.
export function AuthorName({ username }: { username: string }) {
  const session = useSession();
  const isMine = session.username === username;

  return (
    <strong>
      {username}
      {isMine && <span className="ml-1 font-normal text-note text-faint">내 게시물</span>}
    </strong>
  );
}

// ── 과제 2: 오류 화면에도 밝기 버튼 달기 ──────────────────────────────

export function ErrorBoundaryWithToggle() {
  const error = useRouteError();

  let title = '문제가 생겼어요';
  let detail: string;

  if (isRouteErrorResponse(error)) {
    title = error.status === 404 ? '없는 페이지예요' : '문제가 생겼어요';
    detail = `${error.status} ${error.data}`;
  } else if (error instanceof Error) {
    detail = error.message;
  } else {
    detail = '알 수 없는 오류입니다';
  }

  // 머리말이 통째로 사라지는 화면이라 밝기 버튼을 여기 직접 놓는다.
  // ThemeProvider 는 라우터 바깥에 있으므로 이 화면도 그 범위 안이다.
  return (
    <main className="mx-auto max-w-[996px] p-4">
      <div className="mb-4 flex items-start justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <ThemeToggle />
      </div>
      <p className="mb-4 text-sm text-faint">{detail}</p>
      <Link className="text-sm underline underline-offset-4" to="/">
        홈으로
      </Link>
    </main>
  );
}

// ── 과제 1: AppProviders 에 나란히 넣기 ────────────────────────────────
// 우리 코드베이스의 AppProviders 는 Step 6 상태를 유지해야 하므로
// 학생이 만들 모양을 여기에 따로 두고 실제로 돌려본다.

export function AnswerAppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <ThemeColorMeta />
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}
