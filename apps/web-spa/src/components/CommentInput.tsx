// apps/web-spa/src/components/CommentInput.tsx

interface CommentInputProps {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  ref: React.Ref<HTMLInputElement>;
}

export function CommentInput({ value, onChange, ref }: CommentInputProps) {
  return (
    <input
      className="flex-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder="댓글 달기..."
      aria-label="댓글 입력"
    />
  );
}
