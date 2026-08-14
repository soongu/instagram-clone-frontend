// apps/web-spa/src/routes/HomePage.tsx
import { useEffect, useState } from 'react';
import { FeedSection } from '../components/FeedSection';
import type { Post } from '../types/instagram';

const FEED_URL = 'http://localhost:8090/api/posts';

export function HomePage() {
  // 세 갈래를 손으로 들고 있어야 한다. 데이터·기다림·실패.
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 늦게 온 응답이 이미 떠난 화면을 덮어쓰지 않게 표시를 남긴다
    let cancelled = false;

    fetch(FEED_URL)
      .then((response) => response.json())
      .then((body) => {
        if (cancelled) {
          return;
        }

        // fetch 는 404 든 500 이든 성공으로 친다. 봉투를 열어봐야 안다.
        if (body.success === false) {
          setErrorMessage(body.message);
          return;
        }

        setPosts(body.data);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setErrorMessage('피드를 불러오지 못했어요');
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
