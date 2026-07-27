// apps/web-spa/src/components/KeyDemo.tsx
import { useState } from 'react';
import { feedPosts } from '../data/feed';

// 줄마다 자기 좋아요 상태를 들고 있다
function DemoRow({ username }: { username: string }) {
  const [liked, setLiked] = useState(false);

  return (
    <li className="key-demo-row">
      <strong>{username}</strong>
      <button
        className={liked ? 'like-button liked' : 'like-button'}
        onClick={() => setLiked(!liked)}
      >
        {liked ? '♥' : '♡'}
      </button>
    </li>
  );
}

// key 를 순서 번호로 준 목록
export function IndexKeyList() {
  const [posts, setPosts] = useState(feedPosts);

  return (
    <section className="key-demo">
      <h3>key = 순서 번호</h3>
      <ul className="key-demo-list">
        {posts.map((post, index) => (
          <DemoRow key={index} username={post.username} />
        ))}
      </ul>
      <button className="hide-button" onClick={() => setPosts(posts.slice(1))}>
        맨 위 게시물 숨기기
      </button>
    </section>
  );
}

// key 를 게시물 id 로 준 목록 — 위와 딱 한 줄 다르다
export function IdKeyList() {
  const [posts, setPosts] = useState(feedPosts);

  return (
    <section className="key-demo">
      <h3>key = 게시물 id</h3>
      <ul className="key-demo-list">
        {posts.map((post) => (
          <DemoRow key={post.id} username={post.username} />
        ))}
      </ul>
      <button className="hide-button" onClick={() => setPosts(posts.slice(1))}>
        맨 위 게시물 숨기기
      </button>
    </section>
  );
}
