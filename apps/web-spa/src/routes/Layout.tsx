// apps/web-spa/src/routes/Layout.tsx
import { Link, Outlet } from 'react-router';
import { ThemeToggle } from '../components/ThemeToggle';

// 주소가 바뀌어도 이 바깥은 살아남는다.
// 갈리는 것은 Outlet 자리 하나뿐이다.
export function Layout() {
  return (
    <main className="@container mx-auto max-w-[996px] py-4 sm:px-4">
      <header className="mb-4 flex items-baseline justify-between">
        <h1 className="mb-4 text-2xl font-bold">인스타그램</h1>
        <nav aria-label="주요 메뉴" className="flex gap-3 text-sm">
          <Link to="/">홈</Link>
          <Link to="/signup">회원가입</Link>
        </nav>
        <ThemeToggle />
      </header>
      <Outlet />
    </main>
  );
}
