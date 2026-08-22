// apps/web-next/i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// next/link 와 next/navigation 을 «언어를 아는» 것으로 바꿔 끼운다.
// 이걸 쓰면 주소에 언어 칸을 손으로 붙이지 않아도 되고,
// usePathname 도 언어 칸을 뗀 주소를 돌려준다.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
