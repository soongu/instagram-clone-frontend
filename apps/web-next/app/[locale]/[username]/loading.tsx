// apps/web-next/app/[username]/loading.tsx

// 이름이 loading 이면 Next 가 알아서 쓴다. 어디에 놓으라고 따로 적지 않는다.
// 이 파일은 같은 칸의 page 와 그 아래를 감싼다 — 같은 칸의 layout 은 안 감싼다.
export default function ProfileLoading() {
  return (
    <>
      <p className="mb-4 text-sm text-black/40">게시물 세는 중…</p>
      <ul className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((slot) => (
          <li key={slot} className="aspect-square animate-pulse rounded bg-black/5" />
        ))}
      </ul>
    </>
  );
}
