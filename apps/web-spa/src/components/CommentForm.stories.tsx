// apps/web-spa/src/components/CommentForm.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CommentForm } from './CommentForm';

// onSubmit 은 fn() 으로 준다. 진짜로 어딘가 보내는 대신
// "불렸는지·무슨 값으로 불렸는지" 를 기억하는 가짜다(F-2 에서 쓰던 그 vi.fn 과 같은 것).
const meta = {
  title: '카탈로그/CommentForm',
  component: CommentForm,
  args: { onSubmit: fn() },
} satisfies Meta<typeof CommentForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

// play 는 이야기가 그려진 '뒤에' 도는 손이다.
// 여기 적는 것은 F-3 에서 쓰던 그 문법 그대로다 — getByRole·userEvent·expect.
export const TypeAndSubmit: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('댓글 입력');
    const submit = canvas.getByRole('button', { name: '게시' });

    // 빈 칸일 때는 게시 버튼이 잠겨 있다
    await expect(submit).toBeDisabled();

    await userEvent.type(input, '사진 좋네요');
    await expect(submit).toBeEnabled();

    await userEvent.click(submit);

    // 앞뒤 공백을 털고 넘긴다
    await expect(args.onSubmit).toHaveBeenCalledWith('사진 좋네요');
    // 보내고 나면 입력칸이 비워진다
    await expect(input).toHaveValue('');
  },
};

// 공백만 친 경우에는 보내지 않는다
export const WhitespaceOnly: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('댓글 입력');

    await userEvent.type(input, '   ');

    await expect(canvas.getByRole('button', { name: '게시' })).toBeDisabled();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
