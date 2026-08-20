// apps/web-next/app/components/CommentSection.tsx
import { fetchComments } from '@/lib/api';
import { CommentForm } from './CommentForm';

// 지시어가 없다. 서버 컴포넌트라 여기서 그냥 기다렸다 받는다.
export async function CommentSection({ postId }: { postId: number }) {
  const comments = await fetchComments(postId);

  return (
    <section className="mt-2 border-t border-black/5 pt-2">
      <ul className="space-y-1">
        {comments.map((comment) => (
          <li key={comment.id} className="text-sm">
            <span className="mr-1 font-semibold">@{comment.username}</span>
            {/* 중괄호로 넣는다. 여기가 오늘의 출발점이다. */}
            <span>{comment.content}</span>
          </li>
        ))}
      </ul>
      <CommentForm postId={postId} />
    </section>
  );
}
