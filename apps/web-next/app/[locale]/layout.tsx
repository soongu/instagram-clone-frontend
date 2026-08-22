// apps/web-next/app/[locale]/layout.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Noto_Sans_KR } from 'next/font/google';
import { HeaderNav } from '../components/HeaderNav';
import { Providers } from '../components/Providers';
import { SignInForm } from '../components/SignInForm';
import { TextScaleStyle } from '../components/TextScaleStyle';
import { routing } from '../../i18n/routing';
import '../globals.css';

// 빌드할 때 폰트 파일을 받아와 우리 서버에서 준다 — 학생 브라우저가 구글을 부르지 않는다.
// subsets 는 "미리 받아둘 조각" 이다. 한글은 여기 못 적는다(뒤에서 이유를 본다).
const notoSansKr = Noto_Sans_KR({ subsets: ['latin'], display: 'swap' });

// metadata 는 컴포넌트가 아니다. 그래서 useTranslations 를 못 쓴다 —
// 훅은 그리는 도중에만 부를 수 있는데 이건 그리기 전에 불린다.
// 대신 기다렸다 받는 getTranslations 를 쓰고, 함수로 바꿔 params 를 받는다.
export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });

  return {
    title: t('title'),
    description: t('description'),
    // 아래 화면이 자기 것을 안 주면 이게 쓰인다 — 링크가 맨몸으로 나가는 일은 없다.
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
    },
  };
}

// 어떤 언어들을 미리 그려둘지 알려준다. 이게 있어야 빌드가 언어별로 한 벌씩 만든다.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// 이 파일이 앱에서 가장 바깥 껍데기다.
// html 과 body 를 여기서 직접 쓴다 — Next 가 대신 만들어주지 않는다.
export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  // 언어가 주소 첫 칸으로 들어온다.
  const { locale } = await params;

  // 우리가 모르는 값이 첫 칸에 오면 그건 언어가 아니다.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // 이 요청이 무슨 언어인지 아래 조각들에게 알려둔다.
  // 이 줄이 있어야 미리 그리는 동안에도 번역을 찾을 수 있다.
  setRequestLocale(locale);

  return (
    <html lang={locale} className={notoSansKr.className}>
      <body className="min-h-screen bg-white text-black antialiased">
        {/* 쿠키를 읽는 조각 하나만 여기서 흘려보낸다. 나머지는 미리 그려진 채로 남는다. */}
        <Suspense fallback={null}>
          <TextScaleStyle />
        </Suspense>
        {/* 번역문을 아래 조각들에게 흘려보낸다. 브라우저에서 도는 조각도 이걸 통해 읽는다. */}
        <NextIntlClientProvider>
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
