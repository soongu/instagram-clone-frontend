// apps/web-next/app/[username]/page.tsx
import { Suspense } from 'react';
import { TopTags } from '@/app/components/TopTags';
import { fetchPostsByUsername, fetchProfile, fetchTopTags } from '@/lib/api';

// 대괄호 칸의 값은 props.params 로 들어온다.
// params 를 기다렸다 받는 이유는 나중에 다룬다 — 지금은 await 를 붙인다.
export default async function ProfilePage({ params }: PageProps<'/[username]'>) {
  const { username } = await params;

  // 셋 다 여기서 출발시킨다. 셋은 서로의 결과가 필요 없다.
  const profileRequest = fetchProfile(username);
  const postsRequest = fetchPostsByUsername(username);
  const tagsRequest = fetchTopTags(username);

  // 화면을 그리는 데 꼭 필요한 둘만 여기서 기다린다.
  const [profile, posts] = await Promise.all([profileRequest, postsRequest]);

  return (
    <>
      <p className="mb-4 text-sm text-black/60">
        게시물 {posts.length} · 팔로워 {profile.followerCount}
      </p>
      {/* 느린 조각은 여기서 안 기다린다. 준비되면 그때 이 자리에 끼워 넣는다. */}
      <Suspense fallback={<p className="mb-4 text-sm text-black/40">태그 세는 중…</p>}>
        <TopTags tags={tagsRequest} />
      </Suspense>
      <ul className="grid grid-cols-3 gap-2">
        {posts.map((post) => (
          <li key={post.id} className="aspect-square rounded bg-black/5 p-3 text-sm">
            <p>{post.content}</p>
            <p className="mt-1 text-black/60">좋아요 {post.likeCount}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
