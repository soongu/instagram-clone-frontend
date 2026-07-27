// B-3 교안이 Step 을 넘어가며 진화시키는 중간 단계 보존 (내부 검증용)
//
// HEAD 의 src/components/*.tsx 는 마지막 Step 의 모습만 남으므로,
// 교안이 Step 1~4 에서 보여주는 중간 형태를 여기에 접미사를 붙여 남긴다.
// 이름과 임포트 경로를 빼면 교안 코드 블록과 글자 단위로 같다.
import { useRef, useState } from 'react';
import type { PostCardProps } from '../src/types/derived';
import { Avatar } from '../src/components/Avatar';
import { LikeButton } from '../src/components/LikeButton';
import { CommentInput } from '../src/components/CommentInput';
import { CommentForm } from '../src/components/CommentForm';
import { PostImage } from '../src/components/PostImage';
import { PostBody } from '../src/components/PostBody';
import { Feed } from '../src/components/Feed';
import { Section } from '../src/components/Section';
import { feedPosts } from '../src/data/feed';
import { toggleLike } from '../src/lib/likes';

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

// ─── Step 2 이전: 버튼 태그를 직접 쓰던 두 곳 ─────────────────
// 같은 <button> 이 두 파일에 흩어져 있고, 잠금·제출 규칙도 각자 적는다.
interface LikeButtonProps {
  liked: boolean;
  likeCount: number;
  onToggle: () => void;
}

export function LikeButtonBefore({ liked, likeCount, onToggle }: LikeButtonProps) {
  return (
    <div className="like-area">
      <button
        className={liked ? 'like-button liked' : 'like-button'}
        onClick={onToggle}
      >
        {liked ? '♥ 좋아요 취소' : '♡ 좋아요'}
      </button>
      {likeCount > 0 && <p className="post-likes">좋아요 {likeCount}개</p>}
    </div>
  );
}

interface CommentFormProps {
  onSubmit: (content: string) => void;
}

export function CommentFormBefore({ onSubmit }: CommentFormProps) {
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isEmpty = content.trim() === '';

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setContent(event.target.value);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isEmpty) {
      return;
    }
    onSubmit(content.trim());
    setContent('');
    inputRef.current?.focus();
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <CommentInput ref={inputRef} value={content} onChange={handleChange} />
      <button className="comment-submit" type="submit" disabled={isEmpty}>
        게시
      </button>
    </form>
  );
}

// ─── Step 1 중간: 쪼갤 이유가 없던 머리 구역 ──────────────────
// Avatar 가 받는 props 를 그대로 넘기기만 한다. 이름만 바뀌었을 뿐
// 화면도 동작도 Avatar 와 완전히 같아서, 파일 하나를 더 둘 값을 못 한다.
interface PostHeaderProps {
  username: string;
  profileImageUrl: string;
}

export function PostHeaderPassthrough({ username, profileImageUrl }: PostHeaderProps) {
  return <Avatar username={username} profileImageUrl={profileImageUrl} />;
}

// ─── Step 1 종료: 머리 구역이 제 몫을 하게 된 모습 ─────────────
// 더보기 버튼이 들어오면서 "둘을 한 줄에 묶는다" 는 이유가 생긴다.
// 이 시점에는 Button 이 아직 없어서 button 태그를 직접 쓴다(Step 2 에서 교체).
export function PostHeaderStep1({ username, profileImageUrl }: PostHeaderProps) {
  return (
    <div className="post-header">
      <Avatar username={username} profileImageUrl={profileImageUrl} />
      <button className="post-more" aria-label="게시물 메뉴">
        ⋯
      </button>
    </div>
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
      <PostHeaderPassthrough username={username} profileImageUrl={profileImageUrl} />
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

// ─── Step 6 이전: 좋아요 상태를 App 이 직접 들고 있던 모습 ──────
// useState 와 갱신 함수와 파생 계산이 화면 코드와 한 덩어리로 섞여 있다.
export function AppBeforeHook() {
  const [posts, setPosts] = useState(feedPosts);
  const likedCount = posts.filter((post) => post.liked).length;

  function handleToggleLike(id: number) {
    setPosts(toggleLike(posts, id));
  }

  return (
    <main className="feed">
      <header className="feed-header">
        <h1 className="feed-title">인스타그램</h1>
        <span className="feed-liked-count">좋아요 누른 게시물 {likedCount}개</span>
      </header>
      <Section title="피드">
        <Feed posts={posts} onToggleLike={handleToggleLike} />
      </Section>
    </main>
  );
}

// ─── Step 1 최종: 머리 구역에 더보기 버튼까지 들어간 카드 ───────
export function PostCardStep1Final({
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
      <PostHeaderStep1 username={username} profileImageUrl={profileImageUrl} />
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
