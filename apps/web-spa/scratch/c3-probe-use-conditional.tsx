// C-3 사전 확인용 — 조건 안에서 use(Context) 를 부르면 린트/타입/컴파일러가 뭐라 하는가
import { createContext, use, useContext } from 'react';

const ProbeContext = createContext<string | null>(null);

// 1) use 를 if 안에서
export function UseInsideIf({ show }: { show: boolean }) {
  if (show) {
    const value = use(ProbeContext);
    return <p>{value}</p>;
  }
  return null;
}

// 2) useContext 를 if 안에서 (비교군 — 훅 규칙 위반이어야 한다)
export function UseContextInsideIf({ show }: { show: boolean }) {
  if (show) {
    const value = useContext(ProbeContext);
    return <p>{value}</p>;
  }
  return null;
}

// 3) use 를 for 안에서
export function UseInsideLoop({ times }: { times: number }) {
  const out: string[] = [];
  for (let i = 0; i < times; i += 1) {
    out.push(use(ProbeContext) ?? '');
  }
  return <p>{out.join(',')}</p>;
}

export { ProbeContext };
