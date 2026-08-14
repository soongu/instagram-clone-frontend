// apps/web-spa/src/routes/HomePage.tsx
import { useEffect, useState } from 'react';
import { ApiError } from '../api/client';
import { fetchFeed } from '../api/posts';
import { FeedSection } from '../components/FeedSection';
import type { Post } from '../types/instagram';

export function HomePage() {
  // 세 갈래를 손으로 들고 있어야 한다. 데이터·기다림·실패.
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 늦게 온 응답이 이미 떠난 화면을 덮어쓰지 않게 표시를 남긴다
    let cancelled = false;

    fetchFeed()
      .then((loaded) => {
        if (cancelled) {
          return;
        }

        setPosts(loaded);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        // 봉투를 여는 일은 인스턴스가 끝냈다. 화면은 사유만 받는다.
        setErrorMessage(error instanceof ApiError ? error.message : '피드를 불러오지 못했어요');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (errorMessage !== null) {
    return <p className="text-sm text-danger-strong">{errorMessage}</p>;
  }

  // 게시물이 도착한 뒤에야 피드를 그린다.
  if (posts === null) {
    return <p className="text-sm text-faint">피드를 불러오는 중이에요…</p>;
  }

  return <FeedSection posts={posts} />;
}
