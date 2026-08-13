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

  // 주소는 표에 있는데 그 데이터가 없는 경우다. 이건 오류라기보다 상태라서
  // 번호를 붙여 던진다 — 받는 쪽이 404 인지 아닌지 구별할 수 있게.
  //
  // 사람이 읽을 말은 본문에 담는다. statusText 는 HTTP reason phrase 라
  // Latin-1 만 받아서, 한글을 넣으면 만드는 순간 TypeError 로 터진다.
  if (post === undefined) {
    throw new Response('게시물을 찾을 수 없습니다', { status: 404 });
  }

  // 여기까지 왔으면 post 는 반드시 있다. 화면이 없음을 신경 쓸 일이 없어졌다.
  return { post };
}
