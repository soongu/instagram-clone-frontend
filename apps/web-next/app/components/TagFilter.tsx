// apps/web-next/app/components/TagFilter.tsx
'use client';

import { use, useState } from 'react';

// 서버가 만들어 내려보낸 Promise 를 여기서 읽는다.
// 이 컴포넌트가 직접 만들면 안 된다 — 다시 그릴 때마다 새것이 되어 영영 안 끝난다.
export function TagFilter({ tags }: { tags: Promise<string[]> }) {
  const list = use(tags);
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <div className="mb-4 flex gap-2 text-sm">
      {list.map((tag) => (
        <button
          key={tag}
          type="button"
          aria-pressed={picked === tag}
          onClick={() => setPicked(picked === tag ? null : tag)}
          className={
            picked === tag
              ? 'rounded border border-black px-2 py-1'
              : 'rounded border border-black/15 px-2 py-1 text-black/60'
          }
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}
