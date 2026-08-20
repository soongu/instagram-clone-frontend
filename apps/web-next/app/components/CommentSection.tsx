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
            {/* 줄바꿈과 링크를 살리려고 글자가 아니라 HTML 로 넣는다.
                이름이 길고 사나운 이유가 있다 — 이 한 줄이 오늘의 문제다. */}
            <span dangerouslySetInnerHTML={{ __html: comment.content }} />
          </li>
        ))}
      </ul>
      <CommentForm postId={postId} />
    </section>
  );
}
