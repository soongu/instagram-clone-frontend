// apps/web-spa/src/components/ConditionalContextDemo.tsx
//
// 이름이 use 로 시작하는데 훅이 아닌 것이 하나 있다.
// 같은 자리에 use 와 useContext 를 나란히 두고 무엇이 갈리는지 보려고 남긴 판이다.
// (b) 는 일부러 규칙을 어겼다. 린트가 먼저 막으면 실행까지 못 가므로 설정에서만 끈다.
import { createContext, use, useContext, useState } from 'react';

const LabelContext = createContext<string | null>(null);

export function LabelProvider({ label, children }: { label: string; children: React.ReactNode }) {
  return <LabelContext value={label}>{children}</LabelContext>;
}

// (a) use — 조건 안에서 불러도 된다. 공식이 그렇게 정했다.
export function ReadWithUse({ show }: { show: boolean }) {
  if (!show) {
    return <p data-testid="a">안 읽음</p>;
  }

  const label = use(LabelContext);

  return <p data-testid="a">{label ?? '없음'}</p>;
}

// (b) useContext — 같은 자리인데 훅이라서 규칙을 받는다.
export function ReadWithUseContext({ show }: { show: boolean }) {
  if (!show) {
    return <p data-testid="b">안 읽음</p>;
  }

  const label = useContext(LabelContext);

  return <p data-testid="b">{label ?? '없음'}</p>;
}

// (c) 앞에 진짜 훅을 하나 두고, 조건부 useContext 를 그 뒤에 놓는다.
// useState 였다면 개수가 달라져 터질 자리인데 useContext 는 안 터진다.
export function ReadWithUseContextAfterState({ show }: { show: boolean }) {
  const [mounted] = useState('붙어있음');

  if (!show) {
    return <p data-testid="c">{`안 읽음(${mounted})`}</p>;
  }

  const label = useContext(LabelContext);

  return <p data-testid="c">{`${label ?? '없음'}(${mounted})`}</p>;
}

// (d) 대조군 — 같은 자리에 진짜 훅을 넣으면 어떻게 되는지.
export function ReadWithConditionalState({ show }: { show: boolean }) {
  const [mounted] = useState('붙어있음');

  if (!show) {
    return <p data-testid="d">{`안 읽음(${mounted})`}</p>;
  }

  const [extra] = useState('하나 더');

  return <p data-testid="d">{`${extra}(${mounted})`}</p>;
}

// (e) 조건부 useContext 를 진짜 훅 두 개 사이에 끼운다.
// 훅 목록에 자리를 잡는다면 뒤 useState 의 순서가 밀려야 한다.
export function SandwichedUseContext({ show }: { show: boolean }) {
  const [first] = useState('앞');

  if (show) {
    const label = useContext(LabelContext);
    void label;
  }

  const [last] = useState('뒤');

  return <p data-testid="e">{`${first}/${last}`}</p>;
}
