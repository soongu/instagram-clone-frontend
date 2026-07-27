// apps/web-spa/src/components/PostCard.tsx
import type { PostCardProps } from '../types/derived';
import { Avatar } from './Avatar';
import { LikeButton } from './LikeButton';

export function PostCard({
  username,
  profileImageUrl,
  imageUrl,
  content,
  liked,
  likeCount,
  commentCount,
}: PostCardProps) {
  return (
    <article className="post-card">
      <Avatar username={username} profileImageUrl={profileImageUrl} />
      <img className="post-image" src={imageUrl} alt={`${username} 의 게시물`} />
      <LikeButton initialLiked={liked} initialLikeCount={likeCount} />
      <p className="post-content">
        <strong>{username}</strong> {content}
      </p>
      <p className="post-comments">댓글 {commentCount}개 모두 보기</p>
    </article>
  );
}
