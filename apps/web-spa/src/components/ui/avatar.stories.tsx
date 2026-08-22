// apps/web-spa/src/components/ui/avatar.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

// meta 는 이 파일이 카탈로그에 무엇을 세우는지 한 번만 적어두는 곳이다.
// title 이 왼쪽 목록의 경로가 되고, component 가 그 아래 이야기들의 주인공이 된다.
const meta = {
  title: '카탈로그/Avatar',
  component: Avatar,
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

// 이야기 하나가 곧 "이 컴포넌트가 이런 상태일 때는 이렇게 보인다" 는 한 장면이다.
export const Default: Story = {
  args: { size: 'default' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://picsum.photos/seed/jaehoon/64/64" alt="jaehoon 프로필 사진" />
      <AvatarFallback>재훈</AvatarFallback>
    </Avatar>
  ),
};

export const Small: Story = {
  ...Default,
  args: { size: 'sm' },
};

export const Large: Story = {
  ...Default,
  args: { size: 'lg' },
};

// 사진 주소가 깨졌을 때 무엇이 보이는지도 카탈로그에 세워둔다.
// 앱을 돌리다가 이 상태를 만나려면 네트워크를 끊어야 하지만 여기서는 한 줄이면 된다.
export const NoImage: Story = {
  args: { size: 'default' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://example.com/없는-사진.png" alt="minji 프로필 사진" />
      <AvatarFallback>민지</AvatarFallback>
    </Avatar>
  ),
};
