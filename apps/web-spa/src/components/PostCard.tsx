// apps/web-spa/src/components/PostCard.tsx
import { useReducer } from 'react';
import type { PostCardProps } from '../types/derived';
import { commentReducer, initialCommentState } from '../lib/comments';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { PostHeader } from './PostHeader';
import { PostImage } from './PostImage';
import { PostBody } from './PostBody';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';

interface PostCardViewProps extends PostCardProps {
  onToggleLike: (id: number) => void;
  modalOpen?: boolean;
  onModalOpenChange?: (open: boolean) => void;
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
  modalOpen,
  onModalOpenChange,
}: PostCardViewProps) {
  // 이 댓글은 이 카드만 쓰니까 카드 안에 둔다
  const [comments, dispatch] = useReducer(commentReducer, initialCommentState);

  // 카드가 스스로 통이 된다고 알린다.
  // 이 줄이 없으면 카드 안쪽이 바깥 main 을 보고 갈려 버린다.
  return (
    <Card className="@container mx-auto mb-6 max-w-[470px] @2col:mb-0">
      <CardHeader>
        <PostHeader username={username} profileImageUrl={profileImageUrl} />
      </CardHeader>
      <PostImage
        imageUrl={imageUrl}
        username={username}
        onLike={() => onToggleLike(id)}
      />
      <CardContent>
        <PostBody
          username={username}
          profileImageUrl={profileImageUrl}
          imageUrl={imageUrl}
          content={content}
          liked={liked}
          likeCount={likeCount}
          commentCount={commentCount + comments.items.length}
          onToggle={() => onToggleLike(id)}
          modalOpen={modalOpen}
          onModalOpenChange={onModalOpenChange}
        />
        <CommentList
          comments={comments.items}
          onRemove={(commentId) => dispatch({ type: 'remove', id: commentId })}
        />
      </CardContent>
      <CardFooter>
        <CommentForm onSubmit={(text) => dispatch({ type: 'add', content: text })} />
      </CardFooter>
    </Card>
  );
}
