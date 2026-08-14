// apps/web-spa/scratch/c6-feed-section-before.tsx
//
// C-6 Step 3 이전의 FeedSection 을 그대로 박제한 것 (내부 검증용)
//
// B-2(상태 끌어올리기)·B-4(알림·탭 제목)·A-5(리듀서) 가 가르친 것은
// "이 컴포넌트가 좋아요를 자기 안에 들고 있다" 는 전제 위에 서 있다.
// C-6 Step 3 에서 그 전제가 바뀌므로, 그 모듈들이 재던 것을 계속 재려면
// 그때의 코드가 그대로 남아 있어야 한다.
//
// c5-effect-fetch-before.tsx · a5-toast-before.tsx 와 같은 성격이다.
// 살아 있는 화면은 이제 src/components/FeedSection.tsx 쪽이다.
import { useEffect } from 'react';
import type { Post } from '../src/types/instagram';
import { useFeed } from '../src/hooks/useFeed';
import { useScrollRestore } from '../src/hooks/useScrollRestore';
import { Feed } from '../src/components/Feed';
import { Section } from '../src/components/Section';
import { Toast } from '../src/components/Toast';
import { ApiError } from '../src/api/client';
import { useFeedQuery, useLikeMutation } from '../src/queries/posts';

// 알림이 화면에 머무는 시간
const TOAST_DURATION = 3000;

interface FeedSectionProps {
  posts: Post[];
  // C-6 Step 1~2 시절에만 쓰던 자리 — 화면은 자기 안에서 바꾸면서 서버에도 알렸다.
  // B-2·B-4·A-5 판은 이것을 안 넘긴다(그 시절엔 서버가 없었다).
  onLike?: (id: number) => void;
}

// 게시물을 이미 손에 쥔 다음부터의 일만 맡는다.
// 가져오는 일은 이 컴포넌트를 그리는 쪽이 한다.
export function FeedSectionBeforeServer({ posts: initialPosts, onLike }: FeedSectionProps) {
  const { posts, likedCount, toast, toggleLike, reachBottom, dismissToast } = useFeed(initialPosts);

  function handleToggleLike(id: number) {
    toggleLike(id);
    onLike?.(id);
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

// C-6 Step 2 를 마쳤을 때의 홈 — 서버에 보내고 무효화까지 하지만
// 화면은 아직 자기 사본을 그린다. Step 2 가 잰 "갈리는 숫자" 를 계속 재는 자리.
export function HomePageBeforeSingleTruth() {
  const { data: posts, isPending, error } = useFeedQuery();
  const likeMutation = useLikeMutation();

  if (error !== null) {
    return (
      <p className="text-sm text-danger-strong">
        {error instanceof ApiError ? error.message : '피드를 불러오지 못했어요'}
      </p>
    );
  }

  if (isPending) {
    return <p className="text-sm text-faint">피드를 불러오는 중이에요…</p>;
  }

  return <FeedSectionBeforeServer posts={posts} onLike={likeMutation.mutate} />;
}
