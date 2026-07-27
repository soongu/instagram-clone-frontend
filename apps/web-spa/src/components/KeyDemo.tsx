// apps/web-spa/src/components/KeyDemo.tsx
import { useState } from 'react';
import { feedPosts } from '../data/feed';
import { LikeButton } from './LikeButton';

// key 를 순서 번호로 준 목록
export function IndexKeyList() {
  const [posts, setPosts] = useState(feedPosts);

  function hideFirst() {
    setPosts(posts.slice(1));
  }

  return (
    <section className="key-demo">
      <h3>key = 순서 번호</h3>
      <ul className="key-demo-list">
        {posts.map((post, index) => (
          <li key={index} className="key-demo-row">
            <strong>{post.username}</strong>
            <LikeButton initialLiked={false} initialLikeCount={0} />
          </li>
        ))}
      </ul>
      <button className="hide-button" onClick={hideFirst}>
        맨 위 게시물 숨기기
      </button>
    </section>
  );
}

// key 를 게시물 id 로 준 목록 — 위와 딱 한 줄 다르다
export function IdKeyList() {
  const [posts, setPosts] = useState(feedPosts);

  function hideFirst() {
    setPosts(posts.slice(1));
  }

  return (
    <section className="key-demo">
      <h3>key = 게시물 id</h3>
      <ul className="key-demo-list">
        {posts.map((post) => (
          <li key={post.id} className="key-demo-row">
            <strong>{post.username}</strong>
            <LikeButton initialLiked={false} initialLikeCount={0} />
          </li>
        ))}
      </ul>
      <button className="hide-button" onClick={hideFirst}>
        맨 위 게시물 숨기기
      </button>
    </section>
  );
}
