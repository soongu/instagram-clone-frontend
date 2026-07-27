// apps/web-spa/src/components/MiniPostCard.tsx
// Step 6 — props 를 처음 붙여보는 최소 버전.

interface MiniCardProps {
  username: string;
  likeCount: number;
}

export function MiniPostCard({ username, likeCount }: MiniCardProps) {
  return (
    <article className="post-card">
      <p className="post-content">
        <strong>{username}</strong>
      </p>
      <p className="post-likes">좋아요 {likeCount}개</p>
    </article>
  );
}

// 구조분해 없이 props 객체를 통째로 받는 모습 — 대조용
export function MiniPostCardWithoutDestructuring(props: MiniCardProps) {
  return (
    <article className="post-card">
      <p className="post-content">
        <strong>{props.username}</strong>
      </p>
      <p className="post-likes">좋아요 {props.likeCount}개</p>
    </article>
  );
}
