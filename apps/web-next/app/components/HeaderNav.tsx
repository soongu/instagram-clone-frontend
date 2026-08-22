// apps/web-next/app/components/HeaderNav.tsx
'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import type { ReactNode } from 'react';
import { useTextScale } from './Providers';
import { UserSearch } from './UserSearch';

// 글자를 여기 적어두지 않는다. 무슨 글자인지는 번역 파일이 정하고
// 여기는 "어느 칸을 꺼낼지" 이름만 들고 있는다.
const items = [
  { href: '/', key: 'home' },
  { href: '/explore', key: 'explore' },
] as const;

// 지금 어느 주소에 와 있는지는 브라우저만 안다.
// 그래서 이 컴포넌트는 클라이언트에서 돈다.
//
// children 으로 받은 것은 이 파일이 import 한 게 아니라 밖에서 만들어져 온다.
// 그래서 이 안에 서버 조각을 끼워 넣을 수 있다 — D-4 에서 본 그 구멍이다.
export function HeaderNav({ children }: { children?: ReactNode }) {
  const pathname = usePathname();
  const { toggle } = useTextScale();
  // 번역 파일의 "Nav" 칸을 연다. 아래에서는 그 안의 이름만 부르면 된다.
  const t = useTranslations('Nav');

  return (
    // flex-wrap 이 없으면 칸들이 제 너비보다 좁게 눌려서 «글자» 가 줄바꿈된다.
    // 줄이 모자라면 글자를 쪼개지 말고 칸 단위로 다음 줄에 내려보낸다.
    <nav className="mx-auto flex max-w-3xl flex-wrap items-center gap-4 p-4 text-sm">
      <span className="font-bold">{t('brand')}</span>
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={active ? 'font-semibold text-black' : 'text-black/50'}
          >
            {t(item.key)}
          </Link>
        );
      })}
      <UserSearch />
      <button
        type="button"
        onClick={toggle}
        className="rounded border border-black/15 px-2 py-1"
      >
        글자 크기
      </button>
      {children}
    </nav>
  );
}
