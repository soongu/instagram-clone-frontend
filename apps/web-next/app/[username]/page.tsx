// apps/web-next/app/[username]/page.tsx
import { fetchPostsByUsername, fetchProfile } from '@/lib/api';

// 대괄호 칸의 값은 props.params 로 들어온다.
// params 를 기다렸다 받는 이유는 나중에 다룬다 — 지금은 await 를 붙인다.
export default async function ProfilePage({ params }: PageProps<'/[username]'>) {
  const { username } = await params;

  // 둘 다 서버에서 직접 물어본다. 훅도, 로딩 상태도 없다.
  const profile = await fetchProfile(username);
  const posts = await fetchPostsByUsername(username);

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
