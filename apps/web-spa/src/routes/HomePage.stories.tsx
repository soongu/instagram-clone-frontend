// apps/web-spa/src/routes/HomePage.stories.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { delay, http, HttpResponse } from 'msw';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { HomePage } from './HomePage';
import { MOCK_API_BASE, ok, resetLikeState } from '../mocks/handlers';

// 이 화면은 혼자 안 선다 — 서버에 물어보고(QueryClientProvider),
// 카드 안에서 주소를 읽는다(MemoryRouter). 앱이 씌워주던 것을 여기서 씌운다.
const meta = {
  title: '카탈로그/화면 - 홈 피드',
  component: HomePage,
  decorators: [
    (Story) => {
      // 이야기마다 새 창고를 준다. 안 그러면 앞 이야기가 받아둔 것이 샌다.
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      return (
        <QueryClientProvider client={client}>
          <MemoryRouter>
            <Story />
          </MemoryRouter>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof HomePage>;

export default meta;

type Story = StoryObj<typeof meta>;

// 목록이 답을 주기 전까지 화면이 무엇을 보여주는지도 카탈로그에 있어야 한다.
//
// 그런데 그냥 두면 흉내 서버가 너무 빨리 답해서 이 순간을 놓칠 수도 있다.
// 이 이야기에서만 답을 영영 안 주게 바꾼다 — F-4 의 server.use() 와 같은 방법이다.
export const Loading: Story = {
  beforeEach: async ({ msw }) => {
    msw.use(
      http.get(`${MOCK_API_BASE}/posts`, async () => {
        await delay('infinite');

        return HttpResponse.json(ok([]));
      }),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('피드를 불러오는 중이에요…')).toBeInTheDocument();
  },
};

export const Loaded: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 목록이 준 게시물이 실제로 카드가 될 때까지 기다린다
    const cards = await canvas.findAllByRole('article');

    await expect(cards).toHaveLength(10);
    await expect(canvas.getByText('좋아요 1240개')).toBeInTheDocument();
  },
};

// 하트를 누르면 목록의 좋아요 쪽 핸들러까지 실제로 다녀온다.
export const LikeRoundTrip: Story = {
  beforeEach: () => {
    // 흉내 서버가 기억하고 있는 것을 비우고 시작한다
    resetLikeState();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findAllByRole('article');

    const [heart] = canvas.getAllByRole('button', { name: '좋아요' });
    await expect(heart).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(heart);

    // 눌린 표시가 바뀌고 개수도 하나 올라간다.
    // 다시 물어봐도 되돌아가지 않는다 — 흉내 서버가 그 사실을 기억하기 때문이다.
    await expect(heart).toHaveAttribute('aria-pressed', 'true');
    await expect(await canvas.findByText('좋아요 1241개')).toBeInTheDocument();
  },
};
