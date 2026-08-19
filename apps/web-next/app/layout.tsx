// apps/web-next/app/layout.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { HeaderNav } from './components/HeaderNav';
import { Providers } from './components/Providers';
import { TextScaleStyle } from './components/TextScaleStyle';
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
        {/* 쿠키를 읽는 조각 하나만 여기서 흘려보낸다. 나머지는 미리 그려진 채로 남는다. */}
        <Suspense fallback={null}>
          <TextScaleStyle />
        </Suspense>
        {/* 브라우저에서 도는 껍데기다. 안에 든 것은 여기서 만들지 않고 children 으로 받는다. */}
        <Providers>
          <header className="border-b border-black/10">
            <HeaderNav />
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
