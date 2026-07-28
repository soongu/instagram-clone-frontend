// apps/web-spa/scratch/b4-scroll-restore-before.ts
// Step 6 에서 고치기 전의 모습 — 넘겨받은 함수를 effect 안에서 그대로 부르는 판.
// 그 함수가 의존성에 들어가는 바람에, 렌더할 때마다 구독을 끊었다 다시 맺는다.
import { useEffect } from 'react';

const STORAGE_KEY = 'feed-scroll';

function isAtBottom() {
  return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
}

export function useScrollRestoreBefore(onReachBottom: () => void) {
  useEffect(() => {
    function handleScroll() {
      sessionStorage.setItem(STORAGE_KEY, String(window.scrollY));

      if (isAtBottom()) {
        onReachBottom();
      }
    }

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [onReachBottom]);
}
