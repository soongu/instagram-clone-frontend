// apps/web-next/app/[username]/error.tsx
'use client';

// 이 파일은 자기 구간의 page 와 그 아래를 감싼다.
// 같은 칸의 layout.tsx 는 안 감싸므로 프로필 머리 부분은 그대로 남는다.
export default function ProfileError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="rounded border border-black/10 p-6">
      <h2 className="mb-2 font-semibold">이 부분을 불러오지 못했어요</h2>
      <p className="mb-4 text-sm text-black/60">
        잠시 뒤 다시 시도해주세요.
        {error.digest ? ` (기록 번호 ${error.digest})` : ''}
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded border border-black/15 px-3 py-1 text-sm"
      >
        다시 시도
      </button>
    </div>
  );
}
