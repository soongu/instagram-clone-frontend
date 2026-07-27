// B-2 교안이 단계적으로 쌓는 중간 코드 스냅샷 (내부 검증용)
//
// 교안은 LikeButton 과 Feed 를 Step 을 넘어가며 고쳐 나간다. HEAD 의 파일은
// 마지막 모습만 남으므로, 중간 Step 의 코드 블록도 실제로 동작한다는 증거를
// 남기려고 여기 모아 둔다. 교안 본문의 경로 주석은 실제 src 경로를 가리킨다.
import { useState } from 'react';
import { feedPosts } from '../src/data/feed';
import { Avatar } from '../src/components/Avatar';
import type { PostCardProps } from '../src/types/derived';

// ── Step 2: src/components/LikeButton.tsx — useState 를 처음 붙인 모습
interface LikeButtonStep2Props {
  initialLikeCount: number;
}

export function LikeButtonStep2({ initialLikeCount }: LikeButtonStep2Props) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  function handleClick() {
    setLikeCount(likeCount + 1);
  }

  return (
    <button className="like-button" onClick={handleClick}>
      좋아요 {likeCount}개
    </button>
  );
}

// ── Step 3: src/components/LikeButton.tsx — 조건부 렌더링까지 얹은 모습
interface LikeButtonStep3Props {
  initialLiked: boolean;
  initialLikeCount: number;
}

export function LikeButtonStep3({
  initialLiked,
  initialLikeCount,
}: LikeButtonStep3Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  function handleClick() {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  }

  return (
    <div className="like-area">
      <button
        className={liked ? 'like-button liked' : 'like-button'}
        onClick={handleClick}
      >
        {liked ? '♥ 좋아요 취소' : '♡ 좋아요'}
      </button>
      {likeCount > 0 && <p className="post-likes">좋아요 {likeCount}개</p>}
    </div>
  );
}

// ── Step 3 반례: 0 을 && 왼쪽에 두면 0 이 화면에 찍힌다
export function ZeroAndTrap({ likeCount }: { likeCount: number }) {
  return <div className="like-area">{likeCount && <p>좋아요 {likeCount}개</p>}</div>;
}

// ── Step 4: src/components/PostCard.tsx — 아직 콜백을 안 받던 모습
function PostCardStep4({
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
      <LikeButtonStep3 initialLiked={liked} initialLikeCount={likeCount} />
      <p className="post-content">
        <strong>{username}</strong> {content}
      </p>
      <p className="post-comments">댓글 {commentCount}개 모두 보기</p>
    </article>
  );
}

// ── Step 4: src/components/Feed.tsx — props 를 받기 전 모습
export function FeedStep4() {
  return (
    <>
      {feedPosts.map((post) => (
        <PostCardStep4 key={post.id} {...post} />
      ))}
    </>
  );
}

// ── Step 4 반례: key 를 아예 안 주면 콘솔 경고가 뜬다
export function FeedWithoutKey() {
  return (
    <ul>
      {feedPosts.map((post) => (
        <li>{post.username}</li>
      ))}
    </ul>
  );
}

// ── Step 7 반례: value 만 주고 onChange 를 안 주면 읽기 전용이 된다
export function ReadOnlyCommentInput() {
  const [content] = useState('');

  return <input className="comment-input" value={content} aria-label="댓글 입력" />;
}
