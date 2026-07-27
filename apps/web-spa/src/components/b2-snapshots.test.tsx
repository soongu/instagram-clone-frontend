// apps/web-spa/src/components/b2-snapshots.test.tsx
// 교안이 중간 Step 에서 보여주는 코드도 실제로 동작하는지 확인한다 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  LikeButtonStep2,
  LikeButtonStep3,
  ZeroAndTrap,
  FeedStep4,
  FeedWithoutKey,
  ReadOnlyCommentInput,
} from '../../scratch/b2-lecture-snapshots';

describe('Step 2 — useState 를 처음 붙인 LikeButton', () => {
  it('누를 때마다 숫자가 하나씩 오른다', async () => {
    const user = userEvent.setup();
    render(<LikeButtonStep2 initialLikeCount={1240} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('좋아요 1240개');

    await user.click(button);
    await user.click(button);

    expect(button).toHaveTextContent('좋아요 1242개');
  });
});

describe('Step 3 — 조건부 렌더링까지 얹은 LikeButton', () => {
  it('상태에 따라 하트와 문구가 함께 바뀐다', async () => {
    const user = userEvent.setup();
    render(<LikeButtonStep3 initialLiked={false} initialLikeCount={1240} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toHaveTextContent('♥ 좋아요 취소');
    expect(screen.getByRole('button')).toHaveClass('liked');
    expect(screen.getByText('좋아요 1241개')).toBeInTheDocument();
  });

  it('좋아요가 0 개면 문구를 아예 안 그린다', () => {
    render(<LikeButtonStep3 initialLiked={false} initialLikeCount={0} />);

    expect(screen.queryByText(/좋아요 \d+개/)).not.toBeInTheDocument();
  });
});

describe('&& 왼쪽에 숫자를 두면 0 이 화면에 찍힌다', () => {
  it('likeCount 가 0 이면 문구 대신 0 이 나온다', () => {
    const { container } = render(<ZeroAndTrap likeCount={0} />);

    expect(container.textContent).toBe('0');
  });

  it('likeCount 가 0 보다 크면 정상으로 보인다', () => {
    const { container } = render(<ZeroAndTrap likeCount={1240} />);

    expect(container.textContent).toBe('좋아요 1240개');
  });
});

describe('Step 4 — props 를 받기 전 Feed', () => {
  it('데이터 배열을 카드 두 장으로 그린다', () => {
    render(<FeedStep4 />);

    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByText('좋아요 1240개')).toBeInTheDocument();
    expect(screen.getByText('좋아요 8500개')).toBeInTheDocument();
  });
});

describe('React 가 콘솔로 알려주는 것들', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('리스트에 key 가 없으면 경고한다', () => {
    const messages: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      messages.push(args.map(String).join(' '));
    });

    render(<FeedWithoutKey />);

    expect(messages.join('\n')).toContain(
      'Each child in a list should have a unique "key" prop.',
    );
  });

  it('value 만 주고 onChange 를 안 주면 읽기 전용이 된다고 알려준다', () => {
    const messages: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      messages.push(args.map(String).join(' '));
    });

    render(<ReadOnlyCommentInput />);

    expect(messages.join('\n')).toContain(
      'You provided a `value` prop to a form field without an `onChange` handler.',
    );
  });
});
