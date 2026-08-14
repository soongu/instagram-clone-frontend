// B-3 과제 1 [구현] 예시답안 (내부 검증용) — 저장한 게시물을 훅으로 관리하기
//
// 답안은 src/ 의 앱을 건드리지 않는다. 학생이 고쳐야 할 PostHeader·PostCard·Feed·App 은
// 여기에 답안판을 따로 두고, 손대지 않는 Card·Button·PostImage·PostBody 는 그대로 가져다 쓴다.
import { useState } from 'react';
import type { Post } from '../src/types/instagram';
import type { PostCardProps } from '../src/types/derived';
import type { DraftComment } from '../src/components/CommentList';
import { Avatar } from '../src/components/Avatar';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { CommentForm } from '../src/components/CommentForm';
import { CommentList } from '../src/components/CommentList';
import { PostBody } from '../src/components/PostBody';
import { PostImage } from '../src/components/PostImage';
import { Section } from '../src/components/Section';
import { useLikeToggle } from '../src/hooks/useLikeToggle';
import { feedPosts } from '../src/data/feed';

// ── apps/web-spa/src/hooks/useSavedPosts.ts
export function useSavedPosts() {
  const [savedIds, setSavedIds] = useState<number[]>([]);

  function isSaved(id: number) {
    return savedIds.includes(id);
  }

  function toggleSave(id: number) {
    // 원본 배열은 그대로 두고 새 배열을 만들어 넣는다
    setSavedIds(
      isSaved(id)
        ? savedIds.filter((savedId) => savedId !== id)
        : [...savedIds, id],
    );
  }

  // 돌려줄 값이 셋이라 배열 대신 객체로 준다
  return { isSaved, toggleSave, savedCount: savedIds.length };
}

// ── apps/web-spa/src/components/SaveButton.tsx
interface SaveButtonProps {
  saved: boolean;
  onToggle: () => void;
}

export function SaveButton({ saved, onToggle }: SaveButtonProps) {
  return (
    <Button
      className={saved ? 'save-button saved' : 'save-button'}
      onClick={onToggle}
      // 기호만 보이는 버튼이라 읽어줄 이름을 따로 준다
      aria-label={saved ? '저장 취소' : '저장'}
    >
      {saved ? '⚑' : '⚐'}
    </Button>
  );
}

// ── apps/web-spa/src/components/PostHeader.tsx (저장 버튼이 늘어난 모습)
interface PostHeaderProps {
  username: string;
  profileImageUrl: string;
  saved: boolean;
  onToggleSave: () => void;
}

export function PostHeaderWithSave({
  username,
  profileImageUrl,
  saved,
  onToggleSave,
}: PostHeaderProps) {
  return (
    <div className="post-header">
      <Avatar username={username} profileImageUrl={profileImageUrl} />
      <SaveButton saved={saved} onToggle={onToggleSave} />
      <Button className="post-more" aria-label="게시물 메뉴">
        ⋯
      </Button>
    </div>
  );
}

// ── apps/web-spa/src/components/PostCard.tsx (저장 여부를 받아 머리 구역에 넘긴다)
interface PostCardViewProps extends PostCardProps {
  onToggleLike: (id: number) => void;
  saved: boolean;
  onToggleSave: (id: number) => void;
}

export function PostCardWithSave({
  id,
  username,
  profileImageUrl,
  imageUrl,
  content,
  liked,
  likeCount,
  commentCount,
  onToggleLike,
  saved,
  onToggleSave,
}: PostCardViewProps) {
  const [comments, setComments] = useState<DraftComment[]>([]);

  function addComment(text: string) {
    setComments([...comments, { id: comments.length + 1, content: text }]);
  }

  return (
    <Card
      className="post-card"
      header={
        <PostHeaderWithSave
          username={username}
          profileImageUrl={profileImageUrl}
          saved={saved}
          onToggleSave={() => onToggleSave(id)}
        />
      }
      footer={<CommentForm onSubmit={addComment} />}
    >
      <PostImage
        imageUrl={imageUrl}
        username={username}
        onLike={() => onToggleLike(id)}
      />
      <PostBody
        id={id}
        username={username}
        profileImageUrl={profileImageUrl}
        imageUrl={imageUrl}
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

// ── apps/web-spa/src/components/Feed.tsx (저장 여부를 카드마다 내려준다)
interface FeedProps {
  posts: Post[];
  onToggleLike: (id: number) => void;
  isSaved: (id: number) => boolean;
  onToggleSave: (id: number) => void;
}

export function FeedWithSave({
  posts,
  onToggleLike,
  isSaved,
  onToggleSave,
}: FeedProps) {
  return (
    <>
      {posts.map((post) => (
        <PostCardWithSave
          key={post.id}
          {...post}
          onToggleLike={onToggleLike}
          saved={isSaved(post.id)}
          onToggleSave={onToggleSave}
        />
      ))}
    </>
  );
}

// ── apps/web-spa/src/App.tsx
export function AppWithSaved() {
  const { posts, likedCount, toggle } = useLikeToggle(feedPosts);
  // 머리말의 합계와 카드의 저장 여부가 같은 목록을 봐야 하므로 여기서 한 번만 부른다
  const { isSaved, toggleSave, savedCount } = useSavedPosts();

  return (
    <main className="feed">
      <header className="feed-header">
        <h1 className="feed-title">인스타그램</h1>
        <span className="feed-liked-count">좋아요 누른 게시물 {likedCount}개</span>
        <span className="feed-saved-count">저장한 게시물 {savedCount}개</span>
      </header>
      <Section title="피드">
        <FeedWithSave
          posts={posts}
          onToggleLike={toggle}
          isSaved={isSaved}
          onToggleSave={toggleSave}
        />
      </Section>
    </main>
  );
}

// ──────────────────────────────────────────────────────────────
// 오답판 1 — 훅을 PostCard 안에서 부른 경우
// ──────────────────────────────────────────────────────────────

interface WrongPostCardProps extends PostCardProps {
  onToggleLike: (id: number) => void;
}

function WrongPostCard({
  id,
  username,
  profileImageUrl,
  imageUrl,
  content,
  liked,
  likeCount,
  commentCount,
  onToggleLike,
}: WrongPostCardProps) {
  // 카드마다 이 훅이 따로 불려서 저장 목록도 카드마다 따로 생긴다
  const { isSaved, toggleSave } = useSavedPosts();
  const [comments, setComments] = useState<DraftComment[]>([]);

  function addComment(text: string) {
    setComments([...comments, { id: comments.length + 1, content: text }]);
  }

  return (
    <Card
      className="post-card"
      header={
        <PostHeaderWithSave
          username={username}
          profileImageUrl={profileImageUrl}
          saved={isSaved(id)}
          onToggleSave={() => toggleSave(id)}
        />
      }
      footer={<CommentForm onSubmit={addComment} />}
    >
      <PostImage
        imageUrl={imageUrl}
        username={username}
        onLike={() => onToggleLike(id)}
      />
      <PostBody
        id={id}
        username={username}
        profileImageUrl={profileImageUrl}
        imageUrl={imageUrl}
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

export function AppWithSavedInCard() {
  const { posts, likedCount, toggle } = useLikeToggle(feedPosts);
  // 머리말이 보는 목록과 카드가 보는 목록이 서로 남남이다
  const { savedCount } = useSavedPosts();

  return (
    <main className="feed">
      <header className="feed-header">
        <h1 className="feed-title">인스타그램</h1>
        <span className="feed-liked-count">좋아요 누른 게시물 {likedCount}개</span>
        <span className="feed-saved-count">저장한 게시물 {savedCount}개</span>
      </header>
      <Section title="피드">
        {posts.map((post) => (
          <WrongPostCard key={post.id} {...post} onToggleLike={toggle} />
        ))}
      </Section>
    </main>
  );
}

// ──────────────────────────────────────────────────────────────
// 오답판 2 — 원본 배열을 그 자리에서 고친 경우
// ──────────────────────────────────────────────────────────────

export function useSavedPostsMutating() {
  const [savedIds, setSavedIds] = useState<number[]>([]);

  function isSaved(id: number) {
    return savedIds.includes(id);
  }

  function toggleSave(id: number) {
    // 들고 있던 배열을 그 자리에서 고치고 같은 배열을 도로 넣는다
    const at = savedIds.indexOf(id);
    if (at === -1) {
      savedIds.push(id);
    } else {
      savedIds.splice(at, 1);
    }
    setSavedIds(savedIds);
  }

  return { isSaved, toggleSave, savedCount: savedIds.length };
}

export function AppWithSavedMutating() {
  const { posts, likedCount, toggle } = useLikeToggle(feedPosts);
  const { isSaved, toggleSave, savedCount } = useSavedPostsMutating();

  return (
    <main className="feed">
      <header className="feed-header">
        <h1 className="feed-title">인스타그램</h1>
        <span className="feed-liked-count">좋아요 누른 게시물 {likedCount}개</span>
        <span className="feed-saved-count">저장한 게시물 {savedCount}개</span>
      </header>
      <Section title="피드">
        <FeedWithSave
          posts={posts}
          onToggleLike={toggle}
          isSaved={isSaved}
          onToggleSave={toggleSave}
        />
      </Section>
    </main>
  );
}
