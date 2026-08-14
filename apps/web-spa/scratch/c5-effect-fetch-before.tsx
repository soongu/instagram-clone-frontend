// C-5 Step 1~5 의 HomePage — 손으로 짜던 판의 스냅샷 (내부 검증용)
//
// Step 6 에서 화면이 useQuery 로 넘어갔다. 그 전에 무엇이 힘들었는지를
// 계속 재려면 그때의 판이 남아 있어야 한다(A-5 의 a5-toast-before 선례).
// 이 파일은 손대지 않는다.
import { useEffect, useState } from 'react';
import { ApiError } from '../src/api/client';
import { fetchFeed } from '../src/api/posts';
// ⚠️ 살아 있는 FeedSection 이 아니라 그 시절 것을 그린다.
// C-6 Step 3 에서 화면이 사본을 안 들게 바뀌었는데, 이 박제가 재는 것은
// "초기값은 한 번만 읽힌다" 라 사본을 드는 쪽이어야 성립한다.
import { FeedSectionBeforeServer as FeedSection } from './c6-feed-section-before';
import type { Post } from '../src/types/instagram';

export function HomePageByEffect() {
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
