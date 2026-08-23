// apps/web-spa/src/components/CommentInput.stories.tsx
import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CommentInput } from './CommentInput';

// 이 셋은 CommentInput 이 반드시 받아야 하는 값이라 카탈로그도 안 적고는 못 넘어간다.
// 실제로 글자를 쥐는 것은 아래 StatefulCommentInput 이고,
// 여기 onChange 와 ref 는 "받기는 받는다" 는 약속을 채우는 자리다.
const meta = {
  title: '카탈로그/CommentInput',
  component: CommentInput,
  args: {
    value: '',
    onChange: () => {},
    ref: null,
  },
} satisfies Meta<typeof CommentInput>;

export default meta;

type Story = StoryObj<typeof meta>;

// CommentInput 은 자기 값을 스스로 안 들고 있다.
// 밖에서 value 를 주고 onChange 로 되돌려받아야 글자가 써진다(B-5 의 controlled 방식).
// 카탈로그에는 그 '밖' 이 없으니 여기서 우리가 대신 맡는다.
function StatefulCommentInput({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);

  return (
    <CommentInput value={value} onChange={(event) => setValue(event.target.value)} ref={ref} />
  );
}

export const Empty: Story = {
  render: (args) => <StatefulCommentInput initial={args.value} />,
};

export const Typed: Story = {
  args: { value: '사진 좋네요' },
  render: (args) => <StatefulCommentInput initial={args.value} />,
};
