// apps/web-next/app/layout.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { HeaderNav } from './components/HeaderNav';
import { Providers } from './components/Providers';
import { SignInForm } from './components/SignInForm';
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
            {/* 머리말은 지금 어느 주소에 와 있는지를 읽는다. 그건 요청이 와야 아는 값이라
                미리 그릴 수 없는 주소가 있다 — 그 자리를 이 경계가 받아준다. */}
            <Suspense fallback={<div className="mx-auto h-14 max-w-3xl" />}>
              {/* 로그인 칸은 쿠키를 읽는 서버 조각이다. 클라이언트 머리말 안에
                  children 으로 끼워 넣는다 — 경계를 넘어가지 않는다. */}
              <HeaderNav>
                <SignInForm />
              </HeaderNav>
            </Suspense>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
