// apps/web-spa/src/routes/RootErrorBoundary.tsx
import { Link, isRouteErrorResponse, useRouteError } from 'react-router';

export function RootErrorBoundary() {
  // 무엇이 던져질지 라우터도 모른다. 그래서 돌려주는 타입이 unknown 이다.
  // unknown 은 좁히기 전에는 아무것도 못 꺼낸다 — 점 하나도 못 찍는다.
  const error = useRouteError();

  let detail: string;

  if (isRouteErrorResponse(error)) {
    // 우리가 Response 를 던진 경우. 상태 번호가 함께 온다.
    detail = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    // 코드가 터지거나 우리가 Error 를 던진 경우
    detail = error.message;
  } else {
    // 문자열이든 뭐든 던질 수 있다. 여기까지 오면 우리가 아는 게 없다.
    detail = '알 수 없는 오류입니다';
  }

  // 이 화면은 Layout 을 대신한다. 껍데기가 통째로 갈리므로 머리말이 없다.
  return (
    <main className="mx-auto max-w-[996px] p-4">
      <h1 className="mb-2 text-2xl font-bold">문제가 생겼어요</h1>
      <p className="mb-4 text-sm text-faint">{detail}</p>
      <Link className="text-sm underline underline-offset-4" to="/">
        홈으로
      </Link>
    </main>
  );
}
