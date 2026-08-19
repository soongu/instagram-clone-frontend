// apps/web-next/app/api/profiles/revalidate/route.ts
import { revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  // get 은 첫 번째 하나만 준다. 같은 이름이 여러 번 오면 getAll 이다.
  const usernames = new URL(request.url).searchParams.getAll('username');

  if (usernames.length === 0) {
    return Response.json(
      { success: false, data: null, message: 'username 이 필요합니다' },
      { status: 400 },
    );
  }

  for (const username of usernames) {
    revalidateTag(`profile:${username}`, 'max');
  }

  return Response.json({
    success: true,
    data: { usernames, count: usernames.length },
    message: null,
  });
}
