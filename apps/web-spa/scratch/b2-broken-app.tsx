// B-2 Step 6 반례 스냅샷 (내부 검증용)
//
// 상태 안의 객체를 그 자리에서 고치면 화면이 안 바뀐다는 것을 실제로 확인하려고
// App 을 toggleLikeInPlace 버전으로 만들어 둔 것이다. 교안은 이 모습을
// "이렇게 하면 안 된다"는 반례로만 보여준다.
import { useState } from 'react';
import { Feed } from '../src/components/Feed';
import { feedPosts } from '../src/data/feed';
import { toggleLikeInPlace } from '../src/lib/likes';

export function BrokenApp() {
  // 다른 테스트가 쓰는 원본을 건드리지 않도록 복사본으로 시작한다
  const [posts, setPosts] = useState(() => feedPosts.map((post) => ({ ...post })));
  const likedCount = posts.filter((post) => post.liked).length;

  function handleToggleLike(id: number) {
    setPosts(toggleLikeInPlace(posts, id));
  }

  return (
    <main className="feed">
      <header className="feed-header">
        <h1 className="feed-title">인스타그램</h1>
        <span className="feed-liked-count">좋아요 누른 게시물 {likedCount}개</span>
      </header>
      <Feed posts={posts} onToggleLike={handleToggleLike} />
    </main>
  );
}
