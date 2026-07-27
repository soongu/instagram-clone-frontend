// apps/web-spa/src/components/CommentForm.tsx
import { useRef, useState } from 'react';
import { Button } from './Button';
import { CommentInput } from './CommentInput';

interface CommentFormProps {
  onSubmit: (content: string) => void;
}

export function CommentForm({ onSubmit }: CommentFormProps) {
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

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <CommentInput ref={inputRef} value={content} onChange={handleChange} />
      <Button className="comment-submit" type="submit" disabled={isEmpty}>
        게시
      </Button>
    </form>
  );
}
