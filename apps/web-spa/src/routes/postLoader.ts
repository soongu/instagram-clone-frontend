// apps/web-spa/src/routes/postLoader.ts
import type { LoaderFunctionArgs } from 'react-router';
import { fetchPost } from '../data/feed';

// 컴포넌트 바깥이다. 화면을 그리기 전에 라우터가 이 함수를 먼저 부른다.
// 훅이 아니라 그냥 함수라서, 주소에서 뽑은 값도 인자로 받는다.
export async function postLoader({ params }: LoaderFunctionArgs) {
  const post = await fetchPost(Number(params.postId));

  return { post };
}
