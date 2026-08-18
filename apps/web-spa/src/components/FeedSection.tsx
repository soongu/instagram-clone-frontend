// apps/web-spa/src/components/FeedSection.tsx
import { useEffect, useState } from 'react';
import type { Post } from '../types/instagram';
import type { FeedToast } from '../lib/feed-state';
import { allSeenToastMessage, likeToastMessage } from '../lib/feed-state';
import { findById } from '../lib/collections';
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
//
// 좋아요는 더 이상 여기 상태가 아니다. 우리가 그리는 posts 는 창고에 있는 것
// 그대로이고, 누르면 서버에 보낸다. 화면이 따로 세지 않으니 틀릴 일도 없다.
export function FeedSection({ posts }: FeedSectionProps) {
  const { mutate: toggleLike } = useLikeMutation();

  // 알림은 이 화면에만 있다가 사라지는 것이라 여기 그대로 둔다.
  const [toast, setToast] = useState<FeedToast | null>(null);

  // 세는 것도 넘겨받은 것에서 센다. 따로 들고 있는 숫자가 없다.
  const likedCount = posts.filter((post) => post.liked).length;

  function handleToggleLike(id: number) {
    const target = findById(posts, id);

    if (!target) {
      return;
    }

    setToast({ message: likeToastMessage(target) });
    toggleLike(id);
  }

  // 피드 끝에 닿으면 여기까지 봤다고 알려준다
  useScrollRestore(() => setToast({ message: allSeenToastMessage(posts) }));

  // 브라우저 탭 제목은 React 가 그리는 화면 밖에 있다. 직접 맞춰줘야 한다.
  useEffect(() => {
    document.title = `인스타그램 (좋아요 ${likedCount})`;
  }, [likedCount]);

  // 알림을 띄웠으면 치우는 것까지가 한 일이다.
  useEffect(() => {
    if (toast === null) {
      return;
    }

    const timerId = setTimeout(() => setToast(null), TOAST_DURATION);

    return () => clearTimeout(timerId);
  }, [toast]);

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
