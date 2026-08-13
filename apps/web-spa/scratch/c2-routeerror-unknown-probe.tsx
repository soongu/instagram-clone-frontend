// C-2 Step 6 채증 — useRouteError 가 주는 것은 unknown 이다
import { isRouteErrorResponse, useRouteError } from 'react-router';

export function WithoutNarrowing() {
  const error = useRouteError();
  // 좁히지 않고 곧바로 꺼내려 하면
  return <p>{error.message}</p>;
}

export function WithNarrowing() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <p>{error.status}</p>;
  }
  if (error instanceof Error) {
    return <p>{error.message}</p>;
  }
  return <p>알 수 없는 오류입니다</p>;
}
