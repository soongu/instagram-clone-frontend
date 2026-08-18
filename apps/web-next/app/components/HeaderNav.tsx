// apps/web-next/app/components/HeaderNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: '홈' },
  { href: '/explore', label: '탐색' },
] as const;

// 지금 어느 주소에 와 있는지는 브라우저만 안다.
// 그래서 이 컴포넌트는 클라이언트에서 돈다.
export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-3xl items-center gap-4 p-4 text-sm">
      <span className="font-bold">인스타그램 클론</span>
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={active ? 'font-semibold text-black' : 'text-black/50'}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
