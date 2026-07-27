// apps/web-spa/src/hooks/useCommentInput.ts
import { useRef, useState } from 'react';

// 댓글 입력창 하나를 돌리는 데 필요한 것을 통째로 묶었다.
// 입력값·입력창 손잡이·빈 값 판정·두 핸들러가 늘 함께 다니던 묶음이다.
export function useCommentInput(onSubmit: (content: string) => void) {
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isEmpty = content.trim() === '';

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setContent(event.target.value);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isEmpty) {
      return;
    }
    onSubmit(content.trim());
    setContent('');
    inputRef.current?.focus();
  }

  return { content, inputRef, isEmpty, handleChange, handleSubmit };
}
