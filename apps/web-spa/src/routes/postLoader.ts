// apps/web-spa/src/routes/postLoader.ts
import type { LoaderFunctionArgs } from 'react-router';
import { fetchPost } from '../data/feed';

// 컴포넌트 바깥이다. 화면을 그리기 전에 라우터가 이 함수를 먼저 부른다.
// 훅이 아니라 그냥 함수라서, 주소에서 뽑은 값도 인자로 받는다.
export async function postLoader({ params }: LoaderFunctionArgs) {
  const id = Number(params.postId);

  // 주소는 사용자가 손으로 칠 수 있는 자리다. 무엇이든 들어온다.
  // 여기서 던지면 화면 대신 ErrorBoundary 가 뜬다.
  if (Number.isNaN(id)) {
    throw new Error(`게시물 번호가 아닙니다: ${params.postId}`);
  }

  const post = await fetchPost(id);

  return { post };
}
