// apps/web-next/app/components/LikeButton.tsx
'use client';

import { useState } from 'react';

// 이 화면에서 브라우저가 맡는 일은 이것 하나다.
// 카드의 나머지(사람 이름·글·격자)는 서버가 그려서 글자로 보낸다.
export function LikeButton({ likeCount, liked }: { likeCount: number; liked: boolean }) {
  const [pressed, setPressed] = useState(liked);
  const [count, setCount] = useState(likeCount);

  function toggle() {
    setPressed(!pressed);
    setCount(pressed ? count - 1 : count + 1);
  }

  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={toggle}
      className="mt-2 text-sm text-black/60"
    >
      {pressed ? '♥' : '♡'} 좋아요 {count}
    </button>
  );
}
