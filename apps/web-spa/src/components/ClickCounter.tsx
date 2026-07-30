// apps/web-spa/src/components/ClickCounter.tsx

export function ClickCounter() {
  // 상태를 배우기 전 단계 — 일반 변수로 세어 본다
  let clickCount = 0;

  function handleClick() {
    clickCount += 1;
    console.log('지금 clickCount 는', clickCount);
  }

  return (
    <button className="cursor-pointer rounded-md border border-line bg-surface px-3 py-1.5 text-sm" onClick={handleClick}>
      눌린 횟수: {clickCount}
    </button>
  );
}
