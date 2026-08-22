// apps/web-spa/.storybook/preview.tsx
import type { Preview } from '@storybook/react-vite'

// 카탈로그는 우리 앱의 index.html 을 안 쓴다. 자기 화면을 따로 그린다.
// 그래서 앱에 걸어둔 스타일도 여기에 다시 한 번 이어줘야 한다.
import '../src/styles/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;