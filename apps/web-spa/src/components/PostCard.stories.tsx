// apps/web-spa/src/components/PostCard.stories.tsx
import { MemoryRouter } from 'react-router';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { PostCard } from './PostCard';

// 카드가 받는 값이 열 개다. 매번 열 개를 적으면 이야기가 값 목록에 파묻힌다.
// meta.args 에 한 벌만 적어두고 각 이야기는 달라지는 것만 덮어쓴다.
//
// ⚠️ 값을 열 개 다 줬는데도 라우터가 필요하다.
// 카드 안쪽의 PostBody 가 주소를 직접 읽기 때문이다(C-4 에서 그렇게 옮겼다).
// props 만 받는 컴포넌트처럼 보이지만 아니었다.
const meta = {
  title: '카탈로그/PostCard',
  component: PostCard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    id: 1,
    username: 'jaehoon',
    profileImageUrl: 'https://picsum.photos/seed/jaehoon/64/64',
    imageUrl: 'https://picsum.photos/seed/post1/640/640',
    mediaKind: 'image',
    content: '오늘 한강 노을이 미쳤다',
    likeCount: 1240,
    commentCount: 32,
    liked: false,
    onToggleLike: fn(),
  },
} satisfies Meta<typeof PostCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Liked: Story = {
  args: { liked: true, likeCount: 1241 },
};

// 댓글이 하나도 없으면 "댓글 N개 모두 보기" 줄이 어떻게 되는지 본다.
export const NoComments: Story = {
  args: { commentCount: 0 },
};
