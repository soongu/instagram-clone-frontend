// apps/web-spa/src/components/CommentList.tsx

export interface DraftComment {
  id: number;
  content: string;
}

interface CommentListProps {
  comments: DraftComment[];
}

// 댓글 한 줄은 자기 상태도 이벤트도 없어서 따로 파일을 만들지 않는다.
// 나중에 한 줄마다 좋아요나 답글이 생기면 그때 CommentItem 으로 꺼낸다.
export function CommentList({ comments }: CommentListProps) {
  return (
    <ul className="comment-list">
      {comments.map((comment) => (
        <li key={comment.id}>
          <strong>me</strong> {comment.content}
        </li>
      ))}
    </ul>
  );
}
