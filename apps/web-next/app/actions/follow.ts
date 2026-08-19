// apps/web-next/app/actions/follow.ts
'use server';

import { updateTag } from 'next/cache';
import { cookies } from 'next/headers';

const API_BASE = 'http://localhost:8090/api';

export type FollowState = {
  /** 아직 눌러본 적이 없으면 null */
  following: boolean | null;
  message: string | null;
};

/**
 * 폼에서 받을 값이 없어서 formData 인자는 아예 안 적었다.
 * 대신 누구를 팔로우하는지는 호출부에서 미리 묶어 보낸다.
 */
export async function follow(username: string, previous: FollowState): Promise<FollowState> {
  // 누가 눌렀는지는 브라우저가 보내준 값이 아니라 서버가 직접 읽는다.
  const me = (await cookies()).get('me')?.value;

  if (me === undefined) {
    return { ...previous, message: '로그인이 필요해요' };
  }

  const response = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}/follow`, {
    method: 'POST',
    headers: { 'X-Actor': me },
  });

  const envelope = await response.json();

  if (!response.ok || !envelope.success) {
    // 실패하면 알던 상태는 그대로 두고 사유만 얹는다.
    return { ...previous, message: envelope.message ?? '팔로우하지 못했어요' };
  }

  // 지난 시간에 붙여둔 이름표를 여기서 처음 부른다.
  // 이 이름이 달린 캐시 칸을 지금 당장 버려라 — 다음에 볼 사람은 새로 만든 것을 본다.
  updateTag(`profile:${username}`);

  return { following: envelope.data.following, message: null };
}
