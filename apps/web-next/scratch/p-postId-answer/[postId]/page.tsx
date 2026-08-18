import { allPosts } from '@/lib/posts';

export default async function PostDetailPage({ params }: PageProps<'/p/[postId]'>) {
  const { postId } = await params;
  const post = allPosts.find((it) => it.id === Number(postId));

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-xl font-bold">{post ? post.content : '없는 게시물'}</h1>
      <p className="mt-2 text-sm text-black/60">postId 의 타입: {typeof postId}</p>
    </main>
  );
}
