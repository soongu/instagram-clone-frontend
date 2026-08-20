// apps/web-next/app/api/auth/[...all]/route.ts
import { auth, demoUsersReady } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// 주소 하나가 아니라 /api/auth 아래 전부를 이 파일이 받는다.
const handlers = toNextJsHandler(auth);

// 씨앗 계정을 심는 동안 로그인 요청이 먼저 도착하면 "그런 사람 없다" 가 된다.
// 서버를 켠 직후 딱 한 번 벌어지는 일이라 눈치채기 어렵다. 심는 것을 기다렸다 넘긴다.
export async function GET(request: Request) {
  await demoUsersReady;
  return handlers.GET(request);
}

export async function POST(request: Request) {
  await demoUsersReady;
  return handlers.POST(request);
}
