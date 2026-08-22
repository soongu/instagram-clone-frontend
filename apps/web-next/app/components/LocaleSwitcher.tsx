// apps/web-next/app/components/LocaleSwitcher.tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

// 목록에 뜨는 이름은 «그 언어 자신의 말» 로 적는다.
// 한국어 화면이라고 "일본어" 라고 쓰면, 일본어 쓰는 사람은 그 글자를 못 읽는다.
// Intl.DisplayNames 에 «보여줄 언어» 를 그 언어 자신으로 주면 알아서 만들어준다.
function nativeName(code: string) {
  return new Intl.DisplayNames([code], { type: 'language' }).of(code) ?? code;
}

export function LocaleSwitcher() {
  const locale = useLocale();
  // 언어 칸이 «빠진» 주소가 온다. /ja/jaehoon 에 있어도 /jaehoon 을 준다.
  // 그래서 보던 화면을 그대로 두고 언어만 갈아 끼울 수 있다.
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('LocaleSwitcher');

  return (
    <select
      aria-label={t('label')}
      value={locale}
      onChange={(event) => {
        router.replace(pathname, { locale: event.target.value });
      }}
      className="rounded border border-black/15 px-2 py-1"
    >
      {routing.locales.map((code) => (
        <option key={code} value={code}>
          {nativeName(code)}
        </option>
      ))}
    </select>
  );
}
