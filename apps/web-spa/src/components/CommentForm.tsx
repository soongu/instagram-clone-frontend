// apps/web-spa/src/components/CommentForm.tsx
import { useState } from 'react';

interface CommentFormProps {
  onSubmit: (content: string) => void;
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const [content, setContent] = useState('');
  const isEmpty = content.trim() === '';

  return (
    <form
      className="comment-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(content.trim());
        setContent('');
      }}
    >
      <input
        className="comment-input"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="댓글 달기..."
        aria-label="댓글 입력"
      />
      <button className="comment-submit" type="submit" disabled={isEmpty}>
        게시
      </button>
    </form>
  );
}
