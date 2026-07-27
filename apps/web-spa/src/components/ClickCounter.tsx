// apps/web-spa/src/components/ClickCounter.tsx

export function ClickCounter() {
  // 상태를 배우기 전 단계 — 일반 변수로 세어 본다
  let clickCount = 0;

  function handleClick() {
    clickCount += 1;
    console.log('지금 clickCount 는', clickCount);
  }

  return (
    <button className="like-button" onClick={handleClick}>
      눌린 횟수: {clickCount}
    </button>
  );
}
