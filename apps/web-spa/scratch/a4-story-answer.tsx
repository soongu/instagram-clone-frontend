// A-4 과제 1 예시답안 — 댓글 입력창 글자 수 세기 (내부 검증용)
//
// 학생이 만드는 파일은 apps/web-spa/src/components/CommentCounter.tsx 이고
// CommentForm 을 함께 고친다. 답안 코드는 여기서 렌더/타입 검증만 하고
// 실제 src 는 교안 진도(HEAD)를 유지한다.
import { useRef, useState } from 'react';
import { CommentInput } from '../src/components/CommentInput';

const MAX_COMMENT_LENGTH = 100;

interface CommentCounterProps {
  count: number;
  max: number;
}

export function CommentCounter({ count, max }: CommentCounterProps) {
  const remaining = max - count;
  const isNearLimit = remaining <= 10;

  return (
    <p
      className={isNearLimit ? 'comment-counter near-limit' : 'comment-counter'}
      aria-label="글자 수"
    >
      {count} / {max}
    </p>
  );
}

interface CommentFormProps {
  onSubmit: (content: string) => void;
}

export function CommentFormWithCounter({ onSubmit }: CommentFormProps) {
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isEmpty = content.trim() === '';
  const isTooLong = content.length > MAX_COMMENT_LENGTH;
  const cannotSubmit = isEmpty || isTooLong;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setContent(event.target.value);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cannotSubmit) {
      return;
    }
    onSubmit(content.trim());
    setContent('');
    inputRef.current?.focus();
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <CommentInput ref={inputRef} value={content} onChange={handleChange} />
      <CommentCounter count={content.length} max={MAX_COMMENT_LENGTH} />
      <button className="comment-submit" type="submit" disabled={cannotSubmit}>
        게시
      </button>
    </form>
  );
}
