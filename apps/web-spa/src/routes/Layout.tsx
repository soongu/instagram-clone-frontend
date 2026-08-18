// apps/web-spa/src/routes/Layout.tsx
import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router';
import { ConnectionIndicator } from '../components/ConnectionIndicator';
import { SignInButton } from '../components/SignInButton';
import { ThemeToggle } from '../components/ThemeToggle';

// NavLink 는 자기가 가리키는 주소에 와 있는지를 알려준다.
// 켜진 링크에는 aria-current="page" 도 알아서 붙는다.
function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'font-semibold text-ink' : 'text-faint';
}

// 주소가 바뀌어도 이 바깥은 살아남는다.
// 갈리는 것은 Outlet 자리 하나뿐이다.
export function Layout() {
  return (
    <main className="@container mx-auto max-w-[996px] py-4 sm:px-4">
      <header className="mb-4 flex items-baseline justify-between">
        <h1 className="mb-4 text-2xl font-bold">인스타그램</h1>
        <nav aria-label="주요 메뉴" className="flex gap-3 text-sm">
          <NavLink to="/" className={navLinkClass}>
            홈
          </NavLink>
          <NavLink to="/explore" className={navLinkClass}>
            탐색
          </NavLink>
          <NavLink to="/signup" className={navLinkClass}>
            회원가입
          </NavLink>
          <NavLink to="/dm/1" className={navLinkClass}>
            쪽지
          </NavLink>
        </nav>
        <ConnectionIndicator />
        <SignInButton />
        <ThemeToggle />
      </header>
      {/* 아직 안 내려받은 화면이 있으면 여기서 기다린다 */}
      <Suspense fallback={<p className="text-sm text-faint">화면을 불러오는 중이에요…</p>}>
        <Outlet />
      </Suspense>
    </main>
  );
}
