// apps/web-next/app/api/profiles/revalidate/route.ts
import { revalidateTag } from 'next/cache';

// 파일 이름이 page 가 아니라 route 다. 그래서 이 주소는 화면을 안 그린다.
// 백엔드에서 사람 정보가 바뀌었을 때 우리에게 알려주라고 열어두는 문이다.
export async function POST(request: Request) {
  // 이 문을 두드리는 쪽에는 브라우저가 없다. 그래서 세션 쿠키로는 누구인지 확인할 수 없다.
  // 대신 우리 서버와 백엔드만 아는 값을 헤더로 받아 맞춰본다.
  //
  // 값을 안 정해두면 아무도 못 들어온다. 열어두는 것보다 닫아두는 쪽이 안전하다.
  const expected = process.env.REVALIDATE_SECRET;

  if (expected === undefined || request.headers.get('x-revalidate-secret') !== expected) {
    return Response.json(
      { success: false, data: null, message: '허락되지 않은 요청입니다' },
      { status: 401 },
    );
  }

  const username = new URL(request.url).searchParams.get('username');

  if (username === null) {
    return Response.json(
      { success: false, data: null, message: 'username 이 필요합니다' },
      { status: 400 },
    );
  }

  // 여기서는 updateTag 를 못 쓴다. 이 자리는 Server Action 이 아니다.
  revalidateTag(`profile:${username}`, 'max');

  return Response.json({ success: true, data: { username }, message: null });
}
