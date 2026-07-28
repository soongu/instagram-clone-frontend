// A-5 교안 본문 주장 채증 (내부 검증용) — 여기 있는 것은 전부 통과해야 정상이다.
//
// 재현:
//   npx tsc --noEmit --ignoreConfig --strict --target es2025 --module esnext \
//     --moduleResolution bundler --jsx react-jsx --lib es2025,dom --skipLibCheck \
//     scratch/a5-claims.tsx
import { useState, useRef, useReducer } from 'react';
import type { DraftComment } from '../src/components/CommentList';
import { commentReducer, initialCommentState } from '../src/lib/comments';

// ① 첫 값이 앞으로 담을 것을 대표하면 꺾쇠를 안 적어도 된다
export function InferredFine() {
  const [content, setContent] = useState('');
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  function handleClick() {
    setContent('노을');
    setCount(3);
    setOpen(true);
  }

  return (
    <p onClick={handleClick}>
      {content} {count} {String(open)}
    </p>
  );
}

// ② 첫 값이 대표하지 못하면 꺾쇠로 직접 알려준다
export function AnnotatedFine() {
  const [message, setMessage] = useState<string | null>(null);
  const [comments, setComments] = useState<DraftComment[]>([]);

  function handleClick() {
    setMessage('업로드했습니다');
    setComments([{ id: 1, content: '노을' }]);
  }

  return (
    <p onClick={handleClick}>
      {message} {comments.length}
    </p>
  );
}

// ③ useRef 의 두 얼굴 — 손잡이는 null 로 시작하고, 값 상자는 첫 값으로 시작한다
export function BothRefFaces() {
  const inputRef = useRef<HTMLInputElement>(null);
  const clickCount = useRef(0);

  function handleClick() {
    clickCount.current += 1;
    // 물음표 하나면 "아직 못 가리키는 동안" 을 건너뛴다
    inputRef.current?.focus();
  }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleClick}>포커스</button>
    </>
  );
}

// ④ 리듀서에 타입을 달아뒀으면 초기값 자리의 빈 배열은 더 이상 문제가 아니다
export function ReducerInfersState() {
  const [comments, dispatch] = useReducer(commentReducer, initialCommentState);

  function handleClick() {
    dispatch({ type: 'add', content: '노을' });
    dispatch({ type: 'remove', id: 1 });
  }

  // comments 는 CommentState 로 추론된다
  const first: DraftComment | undefined = comments.items[0];
  const next: number = comments.nextId;

  return (
    <p onClick={handleClick}>
      {first?.content} {next}
    </p>
  );
}
