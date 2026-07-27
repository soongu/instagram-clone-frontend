// apps/web-spa/src/components/PostCard.tsx
import { useState } from 'react';
import type { PostCardProps } from '../types/derived';
import type { DraftComment } from './CommentList';
import { Card } from './Card';
import { PostHeader } from './PostHeader';
import { PostImage } from './PostImage';
import { PostBody } from './PostBody';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';

interface PostCardViewProps extends PostCardProps {
  onToggleLike: (id: number) => void;
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
    <Card
      className="post-card"
      header={<PostHeader username={username} profileImageUrl={profileImageUrl} />}
      footer={<CommentForm onSubmit={addComment} />}
    >
      <PostImage
        imageUrl={imageUrl}
        username={username}
        onLike={() => onToggleLike(id)}
      />
      <PostBody
        username={username}
        content={content}
        liked={liked}
        likeCount={likeCount}
        commentCount={commentCount + comments.length}
        onToggle={() => onToggleLike(id)}
      />
      <CommentList comments={comments} />
    </Card>
  );
}
