// C-1 Step 6 교안이 먼저 보여주는 "이렇게 해봤더니" 단계 보존 (내부 검증용)
//
// HEAD 의 src/routes/Layout.tsx 는 <Link> 로 고친 뒤의 모습만 남으므로,
// 교안이 먼저 시도해 보는 <a href> 형태를 여기에 남긴다.
// 이름과 임포트 경로를 빼면 교안 코드 블록과 글자 단위로 같다.
import { Outlet } from 'react-router';
import { ThemeToggle } from '../src/components/ThemeToggle';

// 주소를 아는데 굳이 새 도구가 필요할까 — 먼저 <a> 로 이어본다
export function AnchorLayout() {
  return (
    <main className="@container mx-auto max-w-[996px] py-4 sm:px-4">
      <header className="mb-4 flex items-baseline justify-between">
        <h1 className="mb-4 text-2xl font-bold">인스타그램</h1>
        <nav aria-label="주요 메뉴" className="flex gap-3 text-sm">
          <a href="/">홈</a>
          <a href="/signup">회원가입</a>
        </nav>
        <ThemeToggle />
      </header>
      <Outlet />
    </main>
  );
}
