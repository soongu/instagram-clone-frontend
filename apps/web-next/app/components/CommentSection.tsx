// apps/web-next/app/components/CommentSection.tsx
import { fetchComments } from '@/lib/api';
import { sanitizeComment } from '@/lib/sanitize';
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
            {/* 여전히 HTML 로 넣는다. 달라진 것은 넣기 전에 한 번 거른다는 것뿐이다.
                이 함수를 빼면 이 줄은 그대로 오늘 오전의 그 줄이 된다. */}
            <span dangerouslySetInnerHTML={{ __html: sanitizeComment(comment.content) }} />
          </li>
        ))}
      </ul>
      <CommentForm postId={postId} />
    </section>
  );
}
