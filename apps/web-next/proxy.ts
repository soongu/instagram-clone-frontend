// apps/web-next/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import { API_BASE } from './lib/config';

// 로그인 안 한 사람이 와야 하는 주소. 여기 없는 주소는 전부 보호된다.
// 새 주소를 만들면 기본이 "보호" 라서, 공개할 것만 이 목록에 적는다.
const PUBLIC_PATHS = ['/signup'];

// 이 파일은 app 폴더 밖, 프로젝트 뿌리에 둔다.
// 요청이 우리 앱에 도착했지만 아직 아무것도 안 그려진 순간에 끼어든다.
// 여기서는 아직 한 글자도 안 나갔으니 상태 코드를 우리가 정할 수 있다.
export async function proxy(request: NextRequest) {
  // 화면을 달라는 요청에만 확인이 필요하다.
  // 폼을 제출하면 같은 주소로 POST 가 오는데, 거기까지 물어볼 이유는 없다.
  if (request.method !== 'GET') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // 공개 주소는 여기서 끝난다. 아래 두 검사를 둘 다 건너뛴다 —
  // 로그인을 요구하지도 않고, 사람 이름으로 착각해 404 를 얹지도 않는다.
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // 들어와도 되는 사람인지부터 본다. 네트워크를 타기 전에 끝나는 검사라 여기가 가장 싸다.
  // 세션 쿠키가 있는지만 본다 — 진짜인지는 화면과 액션이 각자 확인한다.
  if (getSessionCookie(request) === null) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const username = pathname.slice(1);

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
