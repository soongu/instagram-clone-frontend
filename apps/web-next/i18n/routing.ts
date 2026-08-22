// apps/web-next/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

// 우리가 지원하기로 한 언어와 기본값.
// 이 목록이 곧 주소 첫 칸에 올 수 있는 값 전부다.
export const routing = defineRouting({
  locales: ['ko', 'en', 'ja', 'ar'],
  defaultLocale: 'ko',
});

// 글이 어느 쪽에서 시작하는지를 언어 목록 바로 옆에 함께 적는다.
//
// Intl 에도 이 값을 알려주는 기능이 있다. 다만 이름이 textInfo 에서 getTextInfo() 로
// 바뀌는 중이라, 실행 환경에 따라 있기도 하고 없기도 하다 — 실제로 우리 빌드가
// "getTextInfo is not a function" 으로 멈췄다. 목록이 네 줄뿐이니 직접 적는 편이 낫다.
//
// satisfies 를 붙여두면 언어를 하나 추가하고 방향을 안 적었을 때
// 화면이 아니라 «타입» 이 먼저 알려준다.
export const localeDirections = {
  ko: 'ltr',
  en: 'ltr',
  ja: 'ltr',
  ar: 'rtl',
} as const satisfies Record<(typeof routing.locales)[number], 'ltr' | 'rtl'>;
