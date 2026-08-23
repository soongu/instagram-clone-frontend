// apps/web-spa/src/routes/Layout.stories.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Layout } from './Layout';
import { ThemeProvider } from '../contexts/ThemeContext';

// ⚠️ 껍데기는 밝기 토글을 들고 있고, 그 토글은 Provider 없이는 아예 던진다.
// C-3 에서 우리가 일부러 그렇게 만들었다 — 조용히 기본값으로 넘어가지 않게.
// 카탈로그에 세우니 그 약속이 그대로 걸린다.
const meta = {
  title: '카탈로그/화면 - 껍데기',
  component: Layout,
  decorators: [
    (Story) => {
      const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

      return (
        <QueryClientProvider client={client}>
          <ThemeProvider>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/" element={<Story />}>
                <Route index element={<p>여기가 화면이 갈리는 자리입니다</p>} />
              </Route>
            </Routes>
          </MemoryRouter>
          </ThemeProvider>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof Layout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 머리말은 화면에 보인다
    await expect(canvas.getByRole('heading', { name: '인스타그램' })).toBeInTheDocument();
    await expect(canvas.getByRole('navigation', { name: '주요 메뉴' })).toBeInTheDocument();

    // 머리말은 <main> 안에 들어 있다. 지난 시간에 확인한 그 구조 그대로다.
    const header = canvasElement.querySelector('main > header');
    await expect(header).not.toBeNull();

    // ⚠️ 그런데 여기서는 banner 로 찾힌다.
    // 지난 시간에 Playwright 로 쟀을 때는 0 이었다.
    // HTML 규칙은 header 가 main 안에 있으면 banner 역할을 잃는다고 정하는데,
    // 그 규칙을 Playwright 는 따르고 Testing Library 는 안 따른다.
    // 같은 화면을 두 도구가 다르게 본다 — 마크업이 애매한 채로 남아 있는 값이다.
    await expect(canvas.queryAllByRole('banner')).toHaveLength(1);
  },
};
