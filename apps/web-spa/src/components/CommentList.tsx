// apps/web-spa/src/components/CommentList.tsx
import { Button } from './Button';

export interface DraftComment {
  id: number;
  content: string;
}

interface CommentListProps {
  comments: DraftComment[];
  // 지울 수 있는 목록에만 넘긴다 — 안 넘기면 × 버튼이 아예 안 그려진다
  onRemove?: (id: number) => void;
}

// 댓글 한 줄은 자기 상태가 없어서 아직 따로 파일을 만들지 않는다.
// 지우는 일도 자기가 하지 않고, 위에서 받은 함수에 번호만 실어 보낸다.
export function CommentList({ comments, onRemove }: CommentListProps) {
  return (
    <ul className="comment-list">
      {comments.map((comment) => (
        <li key={comment.id}>
          <strong>me</strong> {comment.content}
          {onRemove && (
            <Button
              className="comment-remove"
              aria-label="댓글 삭제"
              onClick={() => onRemove(comment.id)}
            >
              ×
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
