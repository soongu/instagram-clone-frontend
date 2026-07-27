// apps/web-spa/src/components/PostCard.tsx
import { useState } from 'react';
import type { PostCardProps } from '../types/derived';
import { Avatar } from './Avatar';
import { LikeButton } from './LikeButton';
import { CommentForm } from './CommentForm';

interface PostCardViewProps extends PostCardProps {
  onToggleLike: (id: number) => void;
}

interface DraftComment {
  id: number;
  content: string;
}

export function PostCard({
  id,
  username,
  profileImageUrl,
  imageUrl,
  content,
  liked,
  likeCount,
  commentCount,
  onToggleLike,
}: PostCardViewProps) {
  // 이 댓글은 이 카드만 쓰니까 카드 안에 둔다
  const [comments, setComments] = useState<DraftComment[]>([]);

  function addComment(text: string) {
    setComments([...comments, { id: comments.length + 1, content: text }]);
  }

  function handleImageDoubleClick(event: React.MouseEvent<HTMLImageElement>) {
    // 더블클릭이 이미지를 선택 상태로 만드는 브라우저 기본 동작을 막는다
    event.preventDefault();
    onToggleLike(id);
  }

  return (
    <article className="post-card">
      <Avatar username={username} profileImageUrl={profileImageUrl} />
      <img
        className="post-image"
        src={imageUrl}
        alt={`${username} 의 게시물`}
        onDoubleClick={handleImageDoubleClick}
      />
      <LikeButton
        liked={liked}
        likeCount={likeCount}
        onToggle={() => onToggleLike(id)}
      />
      <p className="post-content">
        <strong>{username}</strong> {content}
      </p>
      <p className="post-comments">
        댓글 {commentCount + comments.length}개 모두 보기
      </p>
      <ul className="comment-list">
        {comments.map((comment) => (
          <li key={comment.id}>
            <strong>me</strong> {comment.content}
          </li>
        ))}
      </ul>
      <CommentForm onSubmit={addComment} />
    </article>
  );
}
