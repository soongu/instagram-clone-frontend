// apps/web-next/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE = 'http://localhost:8090/api';

// 이 파일은 app 폴더 밖, 프로젝트 뿌리에 둔다.
// 요청이 우리 앱에 도착했지만 아직 아무것도 안 그려진 순간에 끼어든다.
// 여기서는 아직 한 글자도 안 나갔으니 상태 코드를 우리가 정할 수 있다.
export async function proxy(request: NextRequest) {
  const username = request.nextUrl.pathname.slice(1);

  const response = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}`);

  if (response.status === 404) {
    // 주소는 그대로 두고 404 화면을 그리게 한다. 상태 코드는 우리가 얹는다.
    return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  // 프로필로 갈 수 있는 주소만 본다. 나머지는 아예 안 거친다.
  matcher: ['/((?!api|_next|favicon.ico|explore).+)'],
};
