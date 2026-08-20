// apps/web-next/app/actions/comment.ts
'use server';

import { currentUser } from '@/lib/session';
import { fetchAsUser } from '@/lib/backend-token';

export type CommentState = {
  message: string | null;
};

/**
 * 어느 게시물에 다는지는 호출부에서 미리 묶어 보낸다.
 * 누가 썼는지는 폼이 보낸 값이 아니라 서버가 쿠키에서 직접 읽는다 — D-8 에서 정한 규칙 그대로다.
 */
export async function addComment(
  postId: number,
  _previous: CommentState,
  formData: FormData,
): Promise<CommentState> {
  const me = await currentUser();

  if (me === null) {
    return { message: '로그인이 필요해요' };
  }

  const content = String(formData.get('content') ?? '').trim();

  if (content === '') {
    return { message: '댓글을 입력해주세요' };
  }

  const response = await fetchAsUser(me, `/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  if (response === null) {
    return { message: '백엔드에 신원을 확인받지 못했어요' };
  }

  const envelope = await response.json();

  if (!response.ok || !envelope.success) {
    return { message: envelope.message ?? '댓글을 저장하지 못했어요' };
  }

  return { message: null };
}
