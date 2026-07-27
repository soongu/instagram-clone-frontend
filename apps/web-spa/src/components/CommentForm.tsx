// apps/web-spa/src/components/CommentForm.tsx
import { Button } from './Button';
import { CommentInput } from './CommentInput';
import { useCommentInput } from '../hooks/useCommentInput';

interface CommentFormProps {
  onSubmit: (content: string) => void;
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const { content, inputRef, isEmpty, handleChange, handleSubmit } =
    useCommentInput(onSubmit);

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <CommentInput ref={inputRef} value={content} onChange={handleChange} />
      <Button className="comment-submit" type="submit" disabled={isEmpty}>
        게시
      </Button>
    </form>
  );
}
