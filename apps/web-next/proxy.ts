// apps/web-next/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { API_BASE } from './lib/config';

// 이 파일은 app 폴더 밖, 프로젝트 뿌리에 둔다.
// 요청이 우리 앱에 도착했지만 아직 아무것도 안 그려진 순간에 끼어든다.
// 여기서는 아직 한 글자도 안 나갔으니 상태 코드를 우리가 정할 수 있다.
export async function proxy(request: NextRequest) {
  // 화면을 달라는 요청에만 확인이 필요하다.
  // 폼을 제출하면 같은 주소로 POST 가 오는데, 거기까지 물어볼 이유는 없다.
  if (request.method !== 'GET') {
    return NextResponse.next();
  }

  // 들어와도 되는 사람인지부터 본다. 네트워크를 타기 전에 끝나는 검사라 여기가 가장 싸다.
  if (request.cookies.get('me') === undefined) {
    return NextResponse.redirect(new URL('/', request.url));
  }

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
