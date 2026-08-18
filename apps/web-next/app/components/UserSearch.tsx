// apps/web-next/app/components/UserSearch.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// 갈 곳이 미리 정해져 있지 않다 — 사용자가 친 글자를 읽어야 정해진다.
// 그래서 <Link> 가 아니라 코드가 보낸다.
export function UserSearch() {
  const router = useRouter();
  const [name, setName] = useState('');

  return (
    <form
      className="ml-auto flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (trimmed === '') return;
        router.push(`/${trimmed}`);
        setName('');
      }}
    >
      <input
        aria-label="사람 찾기"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="사람 찾기"
        className="w-28 rounded border border-black/15 px-2 py-1"
      />
      <button type="submit" className="rounded border border-black/15 px-2 py-1">
        이동
      </button>
    </form>
  );
}
