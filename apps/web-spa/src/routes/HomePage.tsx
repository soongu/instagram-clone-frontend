// apps/web-spa/src/routes/HomePage.tsx
import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Feed } from '../components/Feed';
import { Section } from '../components/Section';
import { Toast } from '../components/Toast';
import { feedPosts } from '../data/feed';
import { useFeed } from '../hooks/useFeed';
import { useScrollRestore } from '../hooks/useScrollRestore';

// 알림이 화면에 머무는 시간
const TOAST_DURATION = 3000;

export function HomePage() {
  const { posts, likedCount, toast, toggleLike, reachBottom, dismissToast } = useFeed(feedPosts);

  // 피드 끝에 닿으면 여기까지 봤다고 알려준다
  useScrollRestore(reachBottom);

  // 어느 게시물이 열려 있는지를 화면이 아니라 주소가 들고 있다.
  // 그래서 새로고침해도 살아남고, 링크로 보내면 상대도 그 상자를 본다.
  const [searchParams, setSearchParams] = useSearchParams();
  const openPost = searchParams.get('post');
  const openPostId = openPost === null ? null : Number(openPost);

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

  // 껍데기(main·머리말)는 Layout 이 들고 있다. 여기는 홈에만 있는 것만 그린다.
  return (
    <>
      <p className="mb-4 text-sm text-faint">좋아요 누른 게시물 {likedCount}개</p>
      <Section title="피드">
        <Feed
          posts={posts}
          onToggleLike={toggleLike}
          openPostId={openPostId}
          onOpenPost={(id) => setSearchParams(id === null ? {} : { post: String(id) })}
        />
      </Section>
      {toast !== null && <Toast message={toast.message} />}
    </>
  );
}
