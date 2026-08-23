// apps/web-spa/.storybook/preview.tsx
import { definePreview } from '@storybook/react-vite';
import addonMsw from 'msw-storybook-addon';

// 카탈로그는 우리 앱의 index.html 을 안 쓴다. 자기 화면을 따로 그린다.
// 그래서 앱에 걸어둔 스타일도 여기에 다시 한 번 이어줘야 한다.
import '../src/styles/globals.css';
import { worker } from '../src/mocks/browser';

// ⚠️ 그냥 객체를 내보내면 addons 가 조용히 무시된다.
// 타입은 통과하고 오류도 안 나는데 애드온이 아예 안 붙는다.
// definePreview() 로 감싸야 실제로 붙는다.
export default definePreview({
  // ⚠️ 검색해서 나오는 예제는 대부분 initialize() 와 mswLoader 를 쓴다.
  // 그건 2.x 방법이고 3.0 에는 initialize 라는 이름이 아예 없다.
  //
  // 그리고 애드온은 흉내 서버를 '켜주기만' 한다 — 목록은 안 읽는다.
  // 그래서 지난 시간에 만든 worker 를 그대로 건네준다.
  // 판이 쓰던 그 목록이 여기서도 그대로 도는 것이다.
  addons: [
    addonMsw(async () => {
      await worker.start({
        quiet: true,
        // 목록에 없는 요청은 그냥 내보낸다.
        // 카탈로그에는 picsum 사진처럼 우리 API 가 아닌 요청이 섞여 있다.
        onUnhandledRequest: 'bypass',
      });

      return worker;
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 도구가 준 기본값은 'todo' 였다 — 위반을 화면에 보여주기만 하고
      // 판은 통과시킨다. 그러면 아무도 안 고친다.
      // 'error' 로 두면 접근성 위반이 빨간 판이 된다.
      test: 'error',
    },
  },
});
