// apps/web-next/app/components/FeedList.tsx
import Image from 'next/image';
import { LikeButton } from './LikeButton';
import { fetchPosts } from '@/lib/api';

// 지시어가 없다. 그러니 서버 컴포넌트다.
// 서버에서 도니까 함수 안에서 그냥 기다렸다 받으면 된다 — 훅도, 상태도 없다.
export async function FeedList() {
  const posts = await fetchPosts();

  return (
    <ul className="space-y-4">
      {posts.map((post, index) => (
        <li key={post.id} className="rounded border border-black/10 p-4">
          <p className="font-semibold">@{post.username}</p>
          {/* 원본이 몇 대 몇인지 알려준다. 그러면 사진이 오기 전에도 그 비율만큼 자리가 비워진다.
              화면 폭에 맞춰 줄어드는 건 className 이 맡는다. */}
          <Image
            src={post.imageUrl}
            alt={post.content}
            width={640}
            height={640}
            className="h-auto w-full"
            // 첫 장은 화면을 열자마자 보이는 자리다. 미루지 않고 곧바로 받는다.
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          <p className="mt-1">{post.content}</p>
          <LikeButton postId={post.id} likeCount={post.likeCount} liked={post.liked} />
        </li>
      ))}
    </ul>
  );
}
