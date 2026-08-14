// C-4 계획 단계 실측 — create<T>()(...) 커리 형태는 언제 필요한가.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Counter {
  count: number;
  inc: () => void;
}

// (A) 커리 형태
export const curried = create<Counter>()((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));

// (B) 커리 없이 타입 인자 직접
export const notCurried = create<Counter>((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));

// (C) 커리 + 미들웨어
export const curriedPersist = create<Counter>()(
  persist(
    (set) => ({
      count: 0,
      inc: () => set((state) => ({ count: state.count + 1 })),
    }),
    { name: 'probe-a' },
  ),
);

// (D) 커리 없이 + 미들웨어
export const notCurriedPersist = create<Counter>(
  persist(
    (set) => ({
      count: 0,
      inc: () => set((state) => ({ count: state.count + 1 })),
    }),
    { name: 'probe-b' },
  ),
);
