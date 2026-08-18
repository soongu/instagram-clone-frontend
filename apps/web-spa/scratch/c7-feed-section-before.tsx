// apps/web-spa/scratch/c7-feed-section-before.tsx
//
// C-7 Step 1 의 "고치기 전" 을 얼려 둔 것이다.
// 지금 살아 있는 FeedSection 은 useLikeMutation() 에서 안 바뀌는 .mutate 만
// 꺼내 쓴다. 여기 것은 결과 객체를 통째로 붙잡는다 — C-6 까지의 모양 그대로다.
//
// 이 파일이 있어야 "그 시절 지표" 를 계속 잴 수 있다. 살아 있는 쪽을 고치면
// 대조군이 사라져서 6 이라는 숫자를 다시는 못 재기 때문이다.
//
// ⚠️ 박제는 자기가 재는 성질까지 함께 얼려야 한다. 여기서 재는 것은
//    "이 컴포넌트의 JSX 가 다시 만들어지느냐" 이고, 그것은 이 파일 안에서
//    닫힌다. 자식(Feed·PostCard)은 몇 번 불렸는지만 세므로 살아 있는 것을 쓴다.
import { useEffect, useState } from 'react';
import type { Post } from '../src/types/instagram';
import type { FeedToast } from '../src/lib/feed-state';
import { allSeenToastMessage, likeToastMessage } from '../src/lib/feed-state';
import { findById } from '../src/lib/collections';
import { useScrollRestore } from '../src/hooks/useScrollRestore';
import { useLikeMutation } from '../src/queries/posts';
import { Feed } from '../src/components/Feed';
import { Section } from '../src/components/Section';
import { Toast } from '../src/components/Toast';

const TOAST_DURATION = 3000;

interface FeedSectionProps {
  posts: Post[];
}

export function FeedSectionBeforeStableIdentity({ posts }: FeedSectionProps) {
  // ★ 여기가 갈리는 한 줄 — 결과를 통째로 받는다
  const likeMutation = useLikeMutation();

  const [toast, setToast] = useState<FeedToast | null>(null);
  const likedCount = posts.filter((post) => post.liked).length;

  function handleToggleLike(id: number) {
    const target = findById(posts, id);

    if (!target) {
      return;
    }

    setToast({ message: likeToastMessage(target) });
    likeMutation.mutate(id);
  }

  useScrollRestore(() => setToast({ message: allSeenToastMessage(posts) }));

  useEffect(() => {
    document.title = `인스타그램 (좋아요 ${likedCount})`;
  }, [likedCount]);

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
