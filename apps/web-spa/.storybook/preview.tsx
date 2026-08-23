// apps/web-spa/.storybook/preview.tsx
import type { Preview } from '@storybook/react-vite';

// 카탈로그는 우리 앱의 index.html 을 안 쓴다. 자기 화면을 따로 그린다.
// 그래서 앱에 걸어둔 스타일도 여기에 다시 한 번 이어줘야 한다.
import '../src/styles/globals.css';

const preview: Preview = {
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
};

export default preview;
