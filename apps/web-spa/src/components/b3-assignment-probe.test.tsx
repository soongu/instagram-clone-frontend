// apps/web-spa/src/components/b3-assignment-probe.test.tsx
// B-3 과제 2 [탐구] 다섯 단계에서 실제로 무슨 일이 나는지 실측한다 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import {
  ProbeFeed,
  CaptionLengthLab,
  SelfLengthPostBody,
  ConditionalToggleLab,
  FunctionSlotCard,
} from '../../scratch/b3-assignment-runtime';
import { feedPosts } from '../data/feed';
import type { Post } from '../types/instagram';

// src/components/PostBody.tsx 와 같은 값
const CAPTION_LIMIT = 10;

function captureConsoleError() {
  const calls: unknown[][] = [];
  const spy = vi
    .spyOn(console, 'error')
    .mockImplementation((...args: unknown[]) => {
      calls.push(args);
    });

  return { calls, restore: () => spy.mockRestore() };
}

async function messageOfClick(name: string) {
  const user = userEvent.setup();

  try {
    await user.click(screen.getByRole('button', { name }));
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }

  return null;
}

// ── 2단계: 지금 피드로는 화면이 안 무너진다
describe('2단계 — 규칙을 어겼는데도 지금 피드는 멀쩡하다', () => {
  it('지금 피드의 캡션은 둘 다 열 글자를 넘는다', () => {
    expect(feedPosts).toHaveLength(2);
    expect(feedPosts[0].content).toBe('오늘 한강 노을이 미쳤다');
    expect(feedPosts[0].content.length).toBe(13);
    expect(feedPosts[1].content).toBe('제주도 3박 4일 기록');
    expect(feedPosts[1].content.length).toBe(12);

    for (const post of feedPosts) {
      expect(post.content.length).toBeGreaterThan(CAPTION_LIMIT);
    }
  });

  it('두 카드 모두 그려지고 접기 버튼도 동작한다', async () => {
    const user = userEvent.setup();
    const { calls, restore } = captureConsoleError();
    render(<ProbeFeed posts={feedPosts} />);

    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: '더 보기' })).toHaveLength(2);
    expect(screen.getByText(/오늘 한강 노/)).toHaveTextContent(
      'jaehoon 오늘 한강 노을이...',
    );

    const [firstToggle] = screen.getAllByRole('button', { name: '더 보기' });
    await user.click(firstToggle);

    expect(screen.getByText(/오늘 한강 노/)).toHaveTextContent(
      'jaehoon 오늘 한강 노을이 미쳤다접기',
    );
    // React 는 아무 불평도 하지 않는다
    expect(calls).toHaveLength(0);
    restore();
  });
});

// ── 3단계: 카드마다 훅 개수가 달라도 멀쩡하다
const shortCaptionPost: Post = {
  id: 3,
  username: 'seungwoo',
  profileImageUrl: 'https://picsum.photos/seed/seungwoo/64/64',
  imageUrl: 'https://picsum.photos/seed/post3/640/640',
  mediaKind: 'image',
  content: '노을',
  hashtagNames: ['노을'],
  likeCount: 320,
  commentCount: 4,
  liked: false,
  createdAt: '2026-07-21T20:00:00',
};

describe('3단계 — 카드마다 훅 개수가 달라도 안 터진다', () => {
  it('짧은 캡션 카드를 더해도 세 장이 다 그려진다', () => {
    const { calls, restore } = captureConsoleError();
    render(<ProbeFeed posts={[...feedPosts, shortCaptionPost]} />);

    expect(screen.getAllByRole('article')).toHaveLength(3);
    // 긴 캡션 카드에만 접기 버튼이 있다 = 카드마다 훅 개수가 다르다
    expect(screen.getAllByRole('button', { name: '더 보기' })).toHaveLength(2);
    expect(screen.getByText(/노을$/)).toHaveTextContent('seungwoo 노을');
    expect(calls).toHaveLength(0);
    restore();
  });

  it('짧은 캡션 카드가 있어도 긴 캡션 카드의 접기는 그대로 동작한다', async () => {
    const user = userEvent.setup();
    render(<ProbeFeed posts={[...feedPosts, shortCaptionPost]} />);

    const [firstToggle] = screen.getAllByRole('button', { name: '더 보기' });
    await user.click(firstToggle);

    expect(screen.getAllByRole('button', { name: '더 보기' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: '접기' })).toBeInTheDocument();
  });
});

// ── 4단계 (가): 길이 바꾸기 버튼이 카드 쪽에 있으면 훅 개수가 0 ↔ 1 이라 안 터진다
describe('4단계 (가) — PostBody 의 훅이 useToggle 하나뿐이면 안 터진다', () => {
  it('짧은 캡션에서 긴 캡션으로 바꿔도 조용하다', async () => {
    const { calls, restore } = captureConsoleError();
    render(<CaptionLengthLab startLong={false} />);

    const message = await messageOfClick('캡션 길이 바꾸기');

    expect(message).toBeNull();
    expect(calls).toHaveLength(0);
    expect(screen.getByRole('button', { name: '더 보기' })).toBeInTheDocument();
    restore();
  });

  it('긴 캡션에서 짧은 캡션으로 바꿔도 조용하다', async () => {
    const { calls, restore } = captureConsoleError();
    render(<CaptionLengthLab startLong />);

    const message = await messageOfClick('캡션 길이 바꾸기');

    expect(message).toBeNull();
    expect(calls).toHaveLength(0);
    expect(screen.queryByRole('button', { name: '더 보기' })).toBeNull();
    restore();
  });

  it('안 터지는 대신 펼쳐둔 상태가 조용히 사라진다', async () => {
    const user = userEvent.setup();
    render(<CaptionLengthLab startLong />);

    await user.click(screen.getByRole('button', { name: '더 보기' }));
    expect(screen.getByRole('button', { name: '접기' })).toBeInTheDocument();

    // 짧게 갔다가 다시 길게 돌아오면 접힌 상태로 되돌아가 있다
    await user.click(screen.getByRole('button', { name: '캡션 길이 바꾸기' }));
    await user.click(screen.getByRole('button', { name: '캡션 길이 바꾸기' }));

    expect(screen.getByRole('button', { name: '더 보기' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '접기' })).toBeNull();
  });
});

// ── 4단계 (나): 길이 바꾸기 버튼을 PostBody 안에 두면 훅 개수가 1 ↔ 2 라 터진다
describe('4단계 (나) — 조건부 훅 앞에 다른 훅이 생기면 터진다', () => {
  it('훅이 하나 늘어나는 쪽으로 바뀌면 "더 많이 불렸다"고 한다', async () => {
    const { calls, restore } = captureConsoleError();
    render(<SelfLengthPostBody startLong={false} />);

    const message = await messageOfClick('캡션 길이 바꾸기');

    expect(message).toBe('Rendered more hooks than during the previous render.');
    // 터지기 직전에 훅 순서가 바뀌었다는 경고가 한 번 더 나온다
    expect(calls).toHaveLength(1);
    expect(String(calls[0][0])).toContain(
      'React has detected a change in the order of Hooks called by',
    );
    expect(calls[0][1]).toBe('SelfLengthPostBody');
    expect(String(calls[0][2])).toContain('1. useState                   useState');
    expect(String(calls[0][2])).toContain('2. undefined                  useState');
    // 화면은 통째로 사라진다
    expect(document.body.textContent).toBe('');
    restore();
  });

  it('훅이 하나 줄어드는 쪽으로 바뀌면 "덜 불렸다"고 한다', async () => {
    const { calls, restore } = captureConsoleError();
    render(<SelfLengthPostBody startLong />);

    const message = await messageOfClick('캡션 길이 바꾸기');

    expect(message).toBe(
      'Rendered fewer hooks than expected. This may be caused by an accidental early return statement.',
    );
    // 이쪽은 순서 경고 없이 곧장 터진다
    expect(calls).toHaveLength(0);
    expect(document.body.textContent).toBe('');
    restore();
  });
});

// ── 갈림의 기준: 조건부 훅 말고 다른 훅이 하나라도 있느냐
describe('조건이 바뀌어도 안 터지는 경계', () => {
  it('ConditionalToggle 은 조건을 뒤집어도 두 방향 다 조용하다', async () => {
    const { calls, restore } = captureConsoleError();
    render(<ConditionalToggleLab start={false} />);

    const goingUp = await messageOfClick('조건 뒤집기');
    expect(goingUp).toBeNull();
    expect(screen.getByRole('button', { name: '더보기' })).toBeInTheDocument();

    const goingDown = await messageOfClick('조건 뒤집기');
    expect(goingDown).toBeNull();
    expect(screen.queryByRole('button', { name: '더보기' })).toBeNull();

    expect(calls).toHaveLength(0);
    restore();
  });
});

// ── 5단계: 슬롯에 함수를 넘기면 타입 검사가 먼저 잡는다
describe('5단계 — 슬롯에 함수를 넘기면', () => {
  it('타입 검사를 억지로 통과시켜 실행하면 화면은 뜨고 그 자리만 비어 있다', () => {
    const { calls, restore } = captureConsoleError();
    render(<FunctionSlotCard />);

    // 아무것도 안 터지고 페이지는 그려진다
    expect(screen.getByRole('article')).toHaveTextContent('노을 사진');
    // 다만 머리말 자리는 아예 안 그려진다
    expect(screen.queryByText('jaehoon')).toBeNull();
    // 그리고 콘솔에 경고가 한 줄 남는다
    expect(calls).toHaveLength(1);
    expect(String(calls[0][0])).toBe(
      'Functions are not valid as a React child. This may happen if you return %s instead of <%s /> from render. Or maybe you meant to call this function rather than return it.\n  <%s>{%s}</%s>',
    );
    restore();
  });
});
