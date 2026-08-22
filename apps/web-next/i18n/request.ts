// apps/web-next/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';

// 이 앱이 무슨 언어로 그려질지를 정하는 곳이다.
// 지금은 한국어로 고정해 둔다 — 어디서 알아낼지는 다음 시간에 정한다.
export default getRequestConfig(async () => {
  const locale = 'ko';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
