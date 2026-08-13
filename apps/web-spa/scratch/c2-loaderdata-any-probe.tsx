// C-2 Step 5 채증 — useLoaderData 의 기본 제네릭이 any 라는 것
import { useLoaderData } from 'react-router';
import type { postLoader } from '../src/routes/postLoader';

export function WithGeneric() {
  const { post } = useLoaderData<typeof postLoader>();
  // 없는 필드를 부르면 여기서 잡힌다
  return <p>{post?.nickname}</p>;
}

export function WithoutGeneric() {
  const { post } = useLoaderData();
  // 똑같이 없는 필드인데 아무 말이 없다
  return <p>{post?.nickname}</p>;
}
