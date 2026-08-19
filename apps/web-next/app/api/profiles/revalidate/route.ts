// apps/web-next/app/api/profiles/revalidate/route.ts
import { revalidateTag } from 'next/cache';

// 파일 이름이 page 가 아니라 route 다. 그래서 이 주소는 화면을 안 그린다.
// 백엔드에서 사람 정보가 바뀌었을 때 우리에게 알려주라고 열어두는 문이다.
export async function POST(request: Request) {
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
