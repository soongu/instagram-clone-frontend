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
    <form className="flex gap-2 border-t border-line-soft p-3" onSubmit={handleSubmit}>
      <CommentInput ref={inputRef} value={content} onChange={handleChange} />
      <Button
        className="cursor-pointer text-sm font-semibold text-brand disabled:cursor-default disabled:text-brand/30"
        type="submit"
        disabled={isEmpty}
      >
        게시
      </Button>
    </form>
  );
}
