// apps/web-spa/src/routes/postLoader.ts
import type { LoaderFunctionArgs } from 'react-router';
import { ApiError } from '../api/client';
import { queryClient } from '../queries/queryClient';
import { postQuery } from '../queries/posts';

// 컴포넌트 바깥이다. 화면을 그리기 전에 라우터가 이 함수를 먼저 부른다.
// 훅이 아니라 그냥 함수라서, 주소에서 뽑은 값도 인자로 받는다.
export async function postLoader({ params }: LoaderFunctionArgs) {
  const id = Number(params.postId);

  // 주소는 사용자가 손으로 칠 수 있는 자리다. 무엇이든 들어온다.
  // 여기서 던지면 화면 대신 ErrorBoundary 가 뜬다.
  if (Number.isNaN(id)) {
    throw new Error(`게시물 번호가 아닙니다: ${params.postId}`);
  }

  try {
    // "창고에 있으면 그걸 쓰고, 없으면 받아서 채워라."
    // 두 가지를 한 번에 한다 — 창고를 채우고, 그 값을 돌려준다.
    const post = await queryClient.ensureQueryData(postQuery(id));

    return { post };
  } catch (error) {
    // 없는 번호면 서버가 404 와 사유를 함께 보낸다.
    // 그것을 라우터가 아는 모양(Response)으로 바꿔 던진다.
    if (error instanceof ApiError && error.status === 404) {
      throw new Response(error.message, { status: 404 });
    }

    throw error;
  }
}
