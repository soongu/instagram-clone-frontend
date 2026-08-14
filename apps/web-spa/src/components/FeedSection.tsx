// apps/web-spa/src/components/FeedSection.tsx
import { useEffect } from 'react';
import type { Post } from '../types/instagram';
import { useFeed } from '../hooks/useFeed';
import { useScrollRestore } from '../hooks/useScrollRestore';
import { useLikeMutation } from '../queries/posts';
import { Feed } from './Feed';
import { Section } from './Section';
import { Toast } from './Toast';

// 알림이 화면에 머무는 시간
const TOAST_DURATION = 3000;

interface FeedSectionProps {
  posts: Post[];
}

// 게시물을 이미 손에 쥔 다음부터의 일만 맡는다.
// 가져오는 일은 이 컴포넌트를 그리는 쪽이 한다.
export function FeedSection({ posts: initialPosts }: FeedSectionProps) {
  const { posts, likedCount, toast, toggleLike, reachBottom, dismissToast } = useFeed(initialPosts);
  const likeMutation = useLikeMutation();

  // 한 번 누르면 두 곳에 알린다 — 화면과 서버.
  function handleToggleLike(id: number) {
    toggleLike(id);
    likeMutation.mutate(id);
  }

  // 피드 끝에 닿으면 여기까지 봤다고 알려준다
  useScrollRestore(reachBottom);

  // 브라우저 탭 제목은 React 가 그리는 화면 밖에 있다. 직접 맞춰줘야 한다.
  useEffect(() => {
    document.title = `인스타그램 (좋아요 ${likedCount})`;
  }, [likedCount]);

  // 알림을 띄웠으면 치우는 것까지가 한 일이다.
  useEffect(() => {
    if (toast === null) {
      return;
    }

    const timerId = setTimeout(dismissToast, TOAST_DURATION);

    return () => clearTimeout(timerId);
  }, [toast, dismissToast]);

  return (
    <>
      <p className="mb-4 text-sm text-faint">좋아요 누른 게시물 {likedCount}개</p>
      <Section title="피드">
        <Feed posts={posts} onToggleLike={handleToggleLike} />
      </Section>
      {toast !== null && <Toast message={toast.message} />}
    </>
  );
}
