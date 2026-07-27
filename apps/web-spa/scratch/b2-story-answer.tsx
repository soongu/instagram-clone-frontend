// B-2 과제 1 [구현] 예시답안 (내부 검증용) — 해시태그로 피드 걸러내기
import { useState } from 'react';
import { Feed } from '../src/components/Feed';
import { feedPosts } from '../src/data/feed';
import { toggleLike } from '../src/lib/likes';
import type { Post } from '../src/types/instagram';

// ── apps/web-spa/src/lib/hashtags.ts
export function collectHashtags(posts: Post[]): string[] {
  return [...new Set(posts.flatMap((post) => post.hashtagNames))];
}

export function visiblePostsOf(posts: Post[], tag: string | null): Post[] {
  return tag === null
    ? posts
    : posts.filter((post) => post.hashtagNames.includes(tag));
}

// ── apps/web-spa/src/components/HashtagFilter.tsx
interface HashtagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onSelect: (tag: string | null) => void;
}

export function HashtagFilter({
  tags,
  selectedTag,
  onSelect,
}: HashtagFilterProps) {
  return (
    <nav className="hashtag-filter">
      <button
        className={selectedTag === null ? 'tag-button selected' : 'tag-button'}
        onClick={() => onSelect(null)}
      >
        전체
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          className={selectedTag === tag ? 'tag-button selected' : 'tag-button'}
          onClick={() => onSelect(tag)}
        >
          #{tag}
        </button>
      ))}
    </nav>
  );
}

// ── apps/web-spa/src/App.tsx
export function AppWithFilter() {
  const [posts, setPosts] = useState(feedPosts);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // 셋 다 상태가 아니라 계산이다
  const tags = collectHashtags(posts);
  const visiblePosts = visiblePostsOf(posts, selectedTag);
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
      <HashtagFilter
        tags={tags}
        selectedTag={selectedTag}
        onSelect={setSelectedTag}
      />
      {visiblePosts.length === 0 ? (
        <p className="empty-feed">이 태그의 게시물이 없어요</p>
      ) : (
        <Feed posts={visiblePosts} onToggleLike={handleToggleLike} />
      )}
    </main>
  );
}
