// apps/web-next/app/layout.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: '인스타그램 클론',
  description: 'Next.js App Router 로 다시 짓는 인스타그램',
};

// 이 파일이 앱에서 가장 바깥 껍데기다.
// html 과 body 를 여기서 직접 쓴다 — Next 가 대신 만들어주지 않는다.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white text-black antialiased">
        <header className="border-b border-black/10">
          <nav className="mx-auto flex max-w-3xl gap-4 p-4 text-sm">
            <span className="font-bold">인스타그램 클론</span>
            <Link href="/">홈</Link>
            <Link href="/explore">탐색</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
