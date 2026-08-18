// apps/web-next/lib/follower-stats.ts

// 팔로워 수를 세어 오는 자리다. 진짜 서버는 다음 시간에 붙이고,
// 지금은 "가끔 실패하는 바깥 서버" 를 흉내만 낸다 — 세 번에 한 번만 성공한다.
let attempts = 0;

export function loadFollowerCount(username: string): number {
  attempts += 1;

  if (attempts % 3 !== 0) {
    throw new Error(`팔로워 집계 서버가 응답하지 않습니다 (${username})`);
  }

  return username.length * 137;
}
