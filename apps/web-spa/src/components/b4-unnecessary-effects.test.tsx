// apps/web-spa/src/components/b4-unnecessary-effects.test.tsx
// effect 로 상태를 맞추는 판과 그렇지 않은 판이 실행 중에 어떻게 갈리는지 잰다.
import { Profiler } from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  DerivedByEffect,
  DerivedInRender,
  ToastByEffect,
  ToastByHandler,
} from '../../scratch/b4-unnecessary-effects-runtime';

const commits: string[] = [];

beforeEach(() => {
  commits.length = 0;
});

function countCommits(id: string) {
  return commits.filter((entry) => entry === id).length;
}

function renderProfiled(id: string, node: React.ReactNode) {
  return render(
    <Profiler id={id} onRender={() => commits.push(id)}>
      {node}
    </Profiler>,
  );
}

describe('계산은 렌더 중에', () => {
  it('effect 로 맞추면 화면이 두 번 그려진다', () => {
    renderProfiled('effect', <DerivedByEffect />);

    expect(countCommits('effect')).toBe(2);
    expect(screen.getByTestId('count')).toHaveTextContent('좋아요 1개');
  });

  it('렌더 중에 계산하면 한 번이면 끝난다', () => {
    renderProfiled('render', <DerivedInRender />);

    expect(countCommits('render')).toBe(1);
    expect(screen.getByTestId('count')).toHaveTextContent('좋아요 1개');
  });

  it('토글할 때도 effect 판은 한 번 더 그린다', () => {
    renderProfiled('effect', <DerivedByEffect />);
    commits.length = 0;

    act(() => {
      screen.getByRole('button').click();
    });

    expect(countCommits('effect')).toBe(2);
  });

  it('토글할 때 렌더 계산 판은 한 번만 그린다', () => {
    renderProfiled('render', <DerivedInRender />);
    commits.length = 0;

    act(() => {
      screen.getByRole('button').click();
    });

    expect(countCommits('render')).toBe(1);
  });
});

describe('이벤트는 핸들러에', () => {
  it('effect 로 감지하면 아무도 안 눌렀는데 알림이 뜬다', () => {
    // 이미 좋아요가 눌려 있는 게시물을 연 상황
    render(<ToastByEffect initialLiked={true} />);

    expect(screen.getByTestId('msg')).toHaveTextContent('게시물을 좋아합니다');
  });

  it('핸들러에 두면 눌러야 뜬다', () => {
    render(<ToastByHandler initialLiked={true} />);

    expect(screen.getByTestId('msg')).toBeEmptyDOMElement();
  });

  it('핸들러 판은 누르면 제대로 뜬다', () => {
    render(<ToastByHandler initialLiked={false} />);

    act(() => {
      screen.getByRole('button').click();
    });

    expect(screen.getByTestId('msg')).toHaveTextContent('게시물을 좋아합니다');
  });
});
