// apps/web-spa/scratch/b1-lecture-snippets.tsx
// 교안이 컴포넌트를 단계적으로 쌓아 올리며 보여주는 "중간 단계" 코드 채증용.
// 최종본은 src/components/ 에 있고, 여기 있는 것은 그 직전 모습들이다.
// 확인 명령: npx tsc --noEmit --ignoreConfig --strict --target es2025 --module esnext \
//            --moduleResolution bundler --jsx react-jsx --lib es2025,dom --skipLibCheck \
//            scratch/b1-lecture-snippets.tsx

// ── Step 4: 가장 단순한 컴포넌트 — 함수가 JSX 를 돌려준다
export function Greeting() {
  return <h1>인스타그램</h1>;
}

// ── Step 5: 값을 안에 적어둔 카드 (아직 props 가 없다)
export function StaticPostCard() {
  const username = 'jaehoon';
  const likeCount = 1240;

  return (
    <article className="post-card">
      <img className="post-image" src="https://picsum.photos/seed/post1/640/640" alt="게시물" />
      <p className="post-likes">좋아요 {likeCount}개</p>
      <p className="post-content">
        <strong>{username}</strong> 오늘 한강 노을이 미쳤다
      </p>
    </article>
  );
}

// ── Step 5: 형제 요소는 프래그먼트로 감싼다
export function TwoLines() {
  return (
    <>
      <h1>인스타그램</h1>
      <p>피드</p>
    </>
  );
}

// ── Step 6: props 두 개짜리 최소 버전
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

// ── Step 6: 구조분해 없이 props 객체를 통째로 받는 모습 (대조용)
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
