// apps/web-next/app/components/TopTags.tsx

// 느린 조각을 별도 컴포넌트로 떼어냈다.
// 요청은 부모가 미리 걸어두고, 여기는 그 결과만 기다린다.
export async function TopTags({ tags }: { tags: Promise<string[]> }) {
  const list = await tags;

  return (
    <p className="mb-4 text-sm text-black/60">
      자주 쓰는 태그 {list.map((tag) => `#${tag}`).join(' ')}
    </p>
  );
}
