// apps/web-spa/src/components/CommentList.tsx
import { IconButton } from './IconButton';
import { List } from './List';

export interface DraftComment {
  id: number;
  content: string;
}

interface CommentListProps {
  comments: DraftComment[];
  // 지울 수 있는 목록에만 넘긴다 — 안 넘기면 × 버튼이 아예 안 그려진다
  onRemove?: (id: number) => void;
}

// 줄줄이 그리는 일은 List 에 맡기고, 한 줄을 어떻게 그릴지만 정한다.
export function CommentList({ comments, onRemove }: CommentListProps) {
  return (
    <List
      items={comments}
      className="px-3 pb-3 text-sm"
      renderItem={(comment) => (
        <>
          <strong>me</strong> {comment.content}
          {onRemove && (
            <IconButton
              className="cursor-pointer px-1 text-sm leading-none text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              aria-label="댓글 삭제"
              onClick={() => onRemove(comment.id)}
            >
              ×
            </IconButton>
          )}
        </>
      )}
    />
  );
}
