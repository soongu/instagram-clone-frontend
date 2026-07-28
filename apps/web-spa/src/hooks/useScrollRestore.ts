// apps/web-spa/src/hooks/useScrollRestore.ts
import { useEffect, useEffectEvent } from 'react';

// 브라우저가 기억해줄 자리 이름. 탭을 닫으면 같이 지워진다.
const STORAGE_KEY = 'feed-scroll';

// 화면 맨 아래에 닿았는지 — 1px 은 소수점 오차를 감안한 여유다
function isAtBottom() {
  return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
}

// 피드를 어디까지 내렸는지 적어뒀다가, 돌아왔을 때 그 자리로 되돌린다.
// 끝까지 내려간 순간에는 넘겨받은 일을 한 번 해준다.
export function useScrollRestore(onReachBottom: () => void) {
  // 구독을 다시 맺는 이유가 되지 않으면서, 불릴 때는 가장 최근 값을 본다
  const handleReachBottom = useEffectEvent(onReachBottom);

  // 하는 일이 다르면 effect 도 나눈다 — 이건 "돌아왔을 때 한 번"
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      window.scrollTo(0, Number(saved));
    }
  }, []);

  // 이건 "스크롤하는 내내"
  useEffect(() => {
    function handleScroll() {
      sessionStorage.setItem(STORAGE_KEY, String(window.scrollY));

      if (isAtBottom()) {
        handleReachBottom();
      }
    }

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}
