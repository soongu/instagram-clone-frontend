// apps/web-spa/src/components/CommentInput.tsx

interface CommentInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  ref: React.Ref<HTMLInputElement>;
}

export function CommentInput({ value, onChange, ref }: CommentInputProps) {
  return (
    <input
      className="comment-input"
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder="댓글 달기..."
      aria-label="댓글 입력"
    />
  );
}
