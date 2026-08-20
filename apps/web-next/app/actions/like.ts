// apps/web-next/app/actions/like.ts
'use server';

import { currentUser } from '@/lib/session';
import { API_BASE } from '@/lib/config';
import { backendTokenFor } from '@/lib/backend-token';

export type LikeState = {
  liked: boolean;
  likeCount: number;
  message: string | null;
};

/**
 * 어느 게시물인지는 호출부에서 미리 묶어 보낸다.
 * 누가 눌렀는지는 브라우저가 보내준 값이 아니라 서버가 쿠키에서 직접 읽는다.
 */
export async function toggleLike(postId: number, previous: LikeState): Promise<LikeState> {
  // 폼이 화면에 없어도 이 함수는 누구나 부를 수 있다. 그래서 매번 확인한다.
  const me = await currentUser();

  if (me === null) {
    return { ...previous, message: '로그인이 필요해요' };
  }

  // 이름 대신 백엔드가 발급한 출입증을 보낸다.
  const token = await backendTokenFor(me);

  if (token === null) {
    return { ...previous, message: '백엔드에 신원을 확인받지 못했어요' };
  }

  const response = await fetch(`${API_BASE}/posts/${postId}/like`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  const envelope = await response.json();

  if (!response.ok || !envelope.success) {
    // 실패하면 알던 상태는 그대로 두고 사유만 얹는다.
    return { ...previous, message: envelope.message ?? '좋아요를 저장하지 못했어요' };
  }

  return { liked: envelope.data.liked, likeCount: envelope.data.likeCount, message: null };
}
