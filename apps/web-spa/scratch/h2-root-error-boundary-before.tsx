// H-1 시점의 오류 화면을 그대로 얼려둔 것.
//
// H-2 에서 살아 있는 RootErrorBoundary 는 경계 안에서 오류를 직접 내보내게 됐다.
// 그런데 H-1 이 재던 것은 "경계가 잡으면 아무것도 안 나간다" 는 그 시절의 성질이라,
// 살아 있는 쪽을 쓰면 그 판이 재는 대상 자체가 사라진다.
// 그래서 그때의 파일을 여기 얼려두고 H-1 의 판만 이것을 쓴다.
import { Link, isRouteErrorResponse, useRouteError } from 'react-router';

export function RootErrorBoundaryBeforeReporting() {
  // 무엇이 던져질지 라우터도 모른다. 그래서 돌려주는 타입이 unknown 이다.
  // unknown 은 좁히기 전에는 아무것도 못 꺼낸다 — 점 하나도 못 찍는다.
  const error = useRouteError();

  let title = '문제가 생겼어요';
  let detail: string;

  if (isRouteErrorResponse(error)) {
    // 우리가 Response 를 던진 경우. 번호가 함께 오니 갈래를 더 나눌 수 있다.
    // 사람이 읽을 말은 statusText 가 아니라 본문(data)에 담겨 온다.
    title = error.status === 404 ? '없는 페이지예요' : '문제가 생겼어요';
    detail = `${error.status} ${error.data}`;
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
      <h1 className="mb-2 text-2xl font-bold">{title}</h1>
      <p className="mb-4 text-sm text-faint">{detail}</p>
      <Link className="text-sm underline underline-offset-4" to="/">
        홈으로
      </Link>
    </main>
  );
}
