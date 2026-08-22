// apps/web-next/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

// 우리가 지원하기로 한 언어와 기본값.
// 이 목록이 곧 주소 첫 칸에 올 수 있는 값 전부다.
export const routing = defineRouting({
  locales: ['ko', 'en', 'ja'],
  defaultLocale: 'ko',
});
