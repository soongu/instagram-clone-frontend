// apps/web-spa/src/components/PostCard.tsx
import type { PostCardProps } from '../types/derived';
import { Avatar } from './Avatar';

export function PostCard({
  username,
  profileImageUrl,
  imageUrl,
  content,
  likeCount,
  commentCount,
}: PostCardProps) {
  return (
    <article className="post-card">
      <Avatar username={username} profileImageUrl={profileImageUrl} />
      <img className="post-image" src={imageUrl} alt={`${username} 의 게시물`} />
      <p className="post-likes">좋아요 {likeCount}개</p>
      <p className="post-content">
        <strong>{username}</strong> {content}
      </p>
      <p className="post-comments">댓글 {commentCount}개 모두 보기</p>
    </article>
  );
}
