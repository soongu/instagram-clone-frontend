// apps/web-spa/src/components/PostBody.tsx
import { LikeButton } from './LikeButton';

interface PostBodyProps {
  username: string;
  content: string;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  onToggle: () => void;
}

// 사진 아래 본문 구역 — 좋아요·캡션·댓글 수가 함께 산다.
export function PostBody({
  username,
  content,
  liked,
  likeCount,
  commentCount,
  onToggle,
}: PostBodyProps) {
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
