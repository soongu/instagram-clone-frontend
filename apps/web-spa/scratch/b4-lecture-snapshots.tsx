// apps/web-spa/scratch/b4-lecture-snapshots.tsx
// 교안이 단계적으로 쌓아가는 중간 형태를 보존한다.
// 최종 파일에는 마지막 모습만 남으므로, 중간 Step 코드는 여기서 이름만 바꿔 살려둔다.
import { useEffect, useState } from 'react';
import { Feed } from '../src/components/Feed';
import { Section } from '../src/components/Section';
import { Toast } from '../src/components/Toast';
import { feedPosts } from '../src/data/feed';
import { useLikeToggle } from '../src/hooks/useLikeToggle';

const TOAST_DURATION = 3000;
const SCROLL_KEY = 'feed-scroll';

// Step 1 — 의존성 배열을 아직 안 배운 시점. 배열 없이 매 렌더마다 돈다.
export function AppStep1() {
  const { posts, likedCount, toggle } = useLikeToggle(feedPosts);

  useEffect(() => {
    document.title = `인스타그램 (좋아요 ${likedCount})`;
  });

  return (
    <main className="feed">
      <header className="feed-header">
        <h1 className="feed-title">인스타그램</h1>
        <span className="feed-liked-count">좋아요 누른 게시물 {likedCount}개</span>
      </header>
      <Section title="피드">
        <Feed posts={posts} onToggleLike={toggle} />
      </Section>
    </main>
  );
}

// Step 3 앞부분 — 알림은 뜨는데 치우는 코드가 없다.
// 연달아 누르면 두 번째 알림이 첫 타이머에 지워져 제 시간을 못 채운다.
export function AppStep3NoCleanup() {
  const { posts, likedCount, toggle } = useLikeToggle(feedPosts);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = `인스타그램 (좋아요 ${likedCount})`;
  }, [likedCount]);

  useEffect(() => {
    if (toastMessage === null) {
      return;
    }

    setTimeout(() => setToastMessage(null), TOAST_DURATION);
  }, [toastMessage]);

  function handleToggleLike(id: number) {
    const target = posts.find((post) => post.id === id);
    toggle(id);

    if (target) {
      setToastMessage(
        target.liked
          ? `${target.username}님의 게시물 좋아요를 취소했습니다`
          : `${target.username}님의 게시물을 좋아합니다`,
      );
    }
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
      {toastMessage !== null && <Toast message={toastMessage} />}
    </main>
  );
}

// Step 5 앞부분 — 아직 저장은 안 하고 듣기만 하는 판.
export function useScrollRestoreListenOnly() {
  useEffect(() => {
    function handleScroll() {
      console.log('지금 위치:', window.scrollY);
    }

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

// Step 5 끝 — 저장과 복원까지 끝났지만 아직 넘겨받는 함수가 없는 판.
export function useScrollRestoreStep5() {
  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);

    if (saved !== null) {
      window.scrollTo(0, Number(saved));
    }
  }, []);

  useEffect(() => {
    function handleScroll() {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    }

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

// Step 5 시점의 App — 훅을 인자 없이 부른다.
export function AppStep5() {
  const { posts, likedCount, toggle } = useLikeToggle(feedPosts);

  useScrollRestoreStep5();

  return (
    <main className="feed">
      <header className="feed-header">
        <h1 className="feed-title">인스타그램</h1>
        <span className="feed-liked-count">좋아요 누른 게시물 {likedCount}개</span>
      </header>
      <Section title="피드">
        <Feed posts={posts} onToggleLike={toggle} />
      </Section>
    </main>
  );
}
