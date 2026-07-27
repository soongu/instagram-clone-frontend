// B-3 교안이 Step 을 넘어가며 진화시키는 중간 단계 보존 (내부 검증용)
//
// HEAD 의 src/components/*.tsx 는 마지막 Step 의 모습만 남으므로,
// 교안이 Step 1~4 에서 보여주는 중간 형태를 여기에 접미사를 붙여 남긴다.
// 이름과 임포트 경로를 빼면 교안 코드 블록과 글자 단위로 같다.
import { useState } from 'react';
import type { PostCardProps } from '../src/types/derived';
import { Avatar } from '../src/components/Avatar';
import { LikeButton } from '../src/components/LikeButton';
import { CommentForm } from '../src/components/CommentForm';
import { PostHeader } from '../src/components/PostHeader';
import { PostImage } from '../src/components/PostImage';
import { PostActions } from '../src/components/PostActions';

interface PostCardViewProps extends PostCardProps {
  onToggleLike: (id: number) => void;
}

interface DraftComment {
  id: number;
  content: string;
}

// ─── Step 1 이전 (A-4 가 남긴 모습) ───────────────────────────
// 한 파일이 머리·사진·좋아요·캡션·댓글까지 전부 그린다.
export function PostCardBefore({
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

// ─── Step 1: 세 구역으로 나눈 직후 (Card 로 조립하기 전) ───────
// 카드는 "무엇이 어떤 순서로 오는지"만 말하고, 각 구역은 자기 파일이 그린다.
export function PostCardStep1({
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
