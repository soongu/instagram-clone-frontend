// apps/web-next/app/api/auth/[...all]/route.ts
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// 주소 하나가 아니라 /api/auth 아래 전부를 이 파일이 받는다.
export const { GET, POST } = toNextJsHandler(auth);
