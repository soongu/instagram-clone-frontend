// C-5 Step 7 반례 — 키에 태그를 안 넣은 판 (내부 검증용)
//
// 무엇을 달라고 했는지가 키에 안 들어가면 캐시는 "같은 것" 이라고 판단한다.
// 실제로 무엇이 일어나는지 실행해서 확인하려고 남겨 둔 판이다.
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { fetchFeed } from '../src/api/posts';

export function FixedKeyExplore() {
  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag');

  const { data = [], isPending } = useQuery({
    // ⚠️ 반례: tag 가 바뀌어도 키는 그대로다
    queryKey: ['posts'],
    queryFn: () => fetchFeed(tag ?? undefined),
  });

  if (isPending) {
    return <p>불러오는 중</p>;
  }

  return (
    <ul aria-label="고정 키 목록">
      {data.map((post) => (
        <li key={post.id}>{post.username}</li>
      ))}
    </ul>
  );
}
