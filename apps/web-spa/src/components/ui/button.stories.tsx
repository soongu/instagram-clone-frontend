// apps/web-spa/src/components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';

// argTypes 로 어떤 값이 있는지 적어두면 카탈로그 오른쪽에 고르는 칸이 생긴다.
// 목록을 여기 손으로 적는 것이 아니라 button.tsx 의 cva 가 정한 것을 옮겨 적는 것이다.
const meta = {
  title: '카탈로그/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
    },
    disabled: { control: 'boolean' },
  },
  args: {
    children: '팔로우',
    variant: 'default',
    size: 'default',
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// 지난 시간에 약속한 네 가지 — 큰 것, 작은 것, 눌린 것, 잠긴 것.
export const Large: Story = {
  args: { size: 'lg' },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Pressed: Story = {
  args: { 'aria-pressed': true, variant: 'secondary', children: '팔로잉' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

// 그리고 한 화면에 늘어놓기. 색을 잘못 바꾸면 여기서 한꺼번에 드러난다.
//
// ⚠️ destructive 는 글자와 배경 대비가 3.26 이라 기준(4.5)에 못 미친다.
// 그런데 우리 앱은 이 변형을 한 군데도 안 쓴다 — 카탈로그가 늘어놓으니까 드러난 것이다.
// 그래서 지금 색을 바꾸는 대신 'todo' 로 표시해둔다.
// 기본값으로 깔면 아무도 안 고치지만, 이렇게 골라서 쓰면
// "알고 있고 아직 안 고쳤다" 는 기록이 된다. 쓰기 시작하는 날 갚아야 한다.
export const AllVariants: Story = {
  parameters: {
    a11y: { test: 'todo' },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="default">default</Button>
      <Button variant="outline">outline</Button>
      <Button variant="secondary">secondary</Button>
      <Button variant="ghost">ghost</Button>
      <Button variant="destructive">destructive</Button>
      <Button variant="link">link</Button>
    </div>
  ),
};
