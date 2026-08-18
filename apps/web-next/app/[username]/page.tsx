// apps/web-next/app/[username]/page.tsx
import { fetchPostsByUsername, fetchProfile } from '@/lib/api';

// 대괄호 칸의 값은 props.params 로 들어온다.
// params 를 기다렸다 받는 이유는 나중에 다룬다 — 지금은 await 를 붙인다.
export default async function ProfilePage({ params }: PageProps<'/[username]'>) {
  const { username } = await params;

  // 둘은 서로의 결과가 필요 없다. 그러니 먼저 둘 다 출발시켜 두고,
  // 그다음에 한꺼번에 기다린다. await 를 두 줄 쓰면 두 번째가 첫 번째를 기다린다.
  const profileRequest = fetchProfile(username);
  const postsRequest = fetchPostsByUsername(username);
  const [profile, posts] = await Promise.all([profileRequest, postsRequest]);

  return (
    <>
      <p className="mb-4 text-sm text-black/60">팔로워 {profile.followerCount}</p>
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
