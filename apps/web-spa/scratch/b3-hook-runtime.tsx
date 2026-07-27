// 훅 규칙을 어긴 컴포넌트가 실행 중에 어떻게 무너지는지 확인용 (내부 검증용)
//
// 린트는 이 파일을 이미 막는다(scratch/b3-hook-rule-errors.tsx.txt 참고).
// 여기서는 "린트를 무시하고 실행까지 갔을 때" 무슨 일이 나는지 보려고
// eslint.config.js 에서 이 파일만 rules-of-hooks 를 꺼 둔다.
import { useState } from 'react';

interface ConditionalHookCardProps {
  withCaption: boolean;
}

export function ConditionalHookCard({ withCaption }: ConditionalHookCardProps) {
  const [liked, setLiked] = useState(false);

  if (withCaption) {
    // 규칙 위반 — 이 훅은 withCaption 이 true 인 렌더에서만 불린다
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button onClick={() => setOpen(!open)}>{open ? '접기' : '더보기'}</button>
        <button onClick={() => setLiked(!liked)}>{liked ? '♥' : '♡'}</button>
      </div>
    );
  }

  return <button onClick={() => setLiked(!liked)}>{liked ? '♥' : '♡'}</button>;
}
