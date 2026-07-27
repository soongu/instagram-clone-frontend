// apps/web-spa/src/components/PostCard.tsx
import { useState } from 'react';
import type { PostCardProps } from '../types/derived';
import { PostHeader } from './PostHeader';
import { PostImage } from './PostImage';
import { PostActions } from './PostActions';
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

  return (
    <article className="post-card">
      <PostHeader username={username} profileImageUrl={profileImageUrl} />
      <PostImage
        imageUrl={imageUrl}
        username={username}
        onLike={() => onToggleLike(id)}
      />
      <PostActions
        username={username}
        content={content}
        liked={liked}
        likeCount={likeCount}
        commentCount={commentCount + comments.length}
        onToggle={() => onToggleLike(id)}
      />
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
