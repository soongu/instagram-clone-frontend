// apps/web-next/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import { API_BASE } from './lib/config';

// 로그인 안 한 사람이 와야 하는 주소. 여기 없는 주소는 전부 보호된다.
// 새 주소를 만들면 기본이 "보호" 라서, 공개할 것만 이 목록에 적는다.
//
// matcher 를 모든 주소로 넓히면서 홈과 탐색이 여기로 들어왔다.
// 홈은 로그인 화면이라 막으면 로그인 자체가 불가능해지고,
// 탐색은 로그인 없이 둘러보는 화면이다.
const PUBLIC_PATHS = ['/', '/explore', '/signup'];

// 이 파일은 app 폴더 밖, 프로젝트 뿌리에 둔다.
// 요청이 우리 앱에 도착했지만 아직 아무것도 안 그려진 순간에 끼어든다.
// 여기서는 아직 한 글자도 안 나갔으니 상태 코드를 우리가 정할 수 있다.
export async function proxy(request: NextRequest) {
  // 요청마다 새로 만든다. 남이 예측할 수 있으면 표시를 흉내 낼 수 있다.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  // 개발 서버에서만 'unsafe-eval' 을 연다.
  // React 가 서버 오류를 브라우저에서 다시 보여주려고 eval 을 쓰기 때문이고,
  // 프로덕션에서는 쓰지 않는다.
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https://picsum.photos`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join('; ');

  // Next 가 script 태그에 번호표를 붙이려면 요청 헤더로도 받아야 한다.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  // 나가는 길이 넷이라 한 군데라도 빠뜨리면 그 주소만 조용히 보호가 빠진다.
  // 그래서 붙이는 일을 여기 한 곳에 모으고, 모든 출구가 이걸 거치게 한다.
  const withCsp = <T extends NextResponse>(response: T): T => {
    response.headers.set('Content-Security-Policy', csp);
    return response;
  };
  const pass = () => withCsp(NextResponse.next({ request: { headers: requestHeaders } }));

  // 화면을 달라는 요청에만 확인이 필요하다.
  // 폼을 제출하면 같은 주소로 POST 가 오는데, 거기까지 물어볼 이유는 없다.
  if (request.method !== 'GET') {
    return pass();
  }

  const { pathname } = request.nextUrl;

  // 공개 주소는 여기서 끝난다. 아래 두 검사를 둘 다 건너뛴다 —
  // 로그인을 요구하지도 않고, 사람 이름으로 착각해 404 를 얹지도 않는다.
  if (PUBLIC_PATHS.includes(pathname)) {
    return pass();
  }

  // 들어와도 되는 사람인지부터 본다. 네트워크를 타기 전에 끝나는 검사라 여기가 가장 싸다.
  // 세션 쿠키가 있는지만 본다 — 진짜인지는 화면과 액션이 각자 확인한다.
  if (getSessionCookie(request) === null) {
    // 어디로 가려고 했는지를 주소에 실어 보낸다.
    // 이 값을 안 남기면 로그인한 뒤에 되돌려 보낼 곳을 아무도 모른다.
    const signInUrl = new URL('/', request.url);
    signInUrl.searchParams.set('next', pathname);
    return withCsp(NextResponse.redirect(signInUrl));
  }

  const username = pathname.slice(1);

  const response = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}`);

  if (response.status === 404) {
    // 주소는 그대로 두고 404 화면을 그리게 한다. 상태 코드는 우리가 얹는다.
    return withCsp(
      NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 }),
    );
  }

  return pass();
}

export const config = {
  // 화면으로 나가는 모든 주소를 본다. 헤더를 빠짐없이 붙이려면 여기가 다 봐야 한다.
  // 끝이 .+ 가 아니라 .* 라 홈(/)도 들어온다.
  matcher: ['/((?!api|_next|favicon.ico).*)'],
};
