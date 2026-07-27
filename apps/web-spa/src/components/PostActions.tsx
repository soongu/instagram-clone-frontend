// apps/web-spa/src/components/PostActions.tsx
import { LikeButton } from './LikeButton';

interface PostActionsProps {
  username: string;
  content: string;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  onToggle: () => void;
}

export function PostActions({
  username,
  content,
  liked,
  likeCount,
  commentCount,
  onToggle,
}: PostActionsProps) {
  return (
    <>
      <LikeButton liked={liked} likeCount={likeCount} onToggle={onToggle} />
      <p className="post-content">
        <strong>{username}</strong> {content}
      </p>
      <p className="post-comments">댓글 {commentCount}개 모두 보기</p>
    </>
  );
}
