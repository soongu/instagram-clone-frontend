// apps/web-spa/src/components/StaticPostCard.tsx
// Step 5 — 값을 안에 적어둔 카드. 아직 props 가 없어서 카드 한 장밖에 못 그린다.

export function StaticPostCard() {
  const username = 'jaehoon';
  const likeCount = 1240;

  return (
    <article className="mb-6 overflow-hidden rounded-lg border border-line bg-surface">
      <img className="w-full cursor-pointer" src="https://picsum.photos/seed/post1/640/640" alt="게시물" />
      <p className="px-3 pt-3 pb-1 text-sm font-semibold">좋아요 {likeCount}개</p>
      <p className="px-3 py-1 text-sm">
        <strong>{username}</strong> 오늘 한강 노을이 미쳤다
      </p>
    </article>
  );
}

// Step 5 — 형제 요소는 프래그먼트로 감싼다
export function TwoLines() {
  return (
    <>
      <h1>인스타그램</h1>
      <p>피드</p>
    </>
  );
}
