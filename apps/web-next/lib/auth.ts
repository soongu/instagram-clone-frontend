// apps/web-next/lib/auth.ts
import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';

// 사람과 세션을 담아둘 곳. 지금은 서버 메모리라 서버를 끄면 사라진다.
// 표(배열)를 미리 만들어 둬야 한다 — 빈 객체를 주면 "Model user not found" 로 죽는다.
const db = { user: [], session: [], account: [], verification: [] };

export const auth = betterAuth({
  database: memoryAdapter(db),
  // 아이디와 비밀번호로 로그인하겠다는 선언.
  emailAndPassword: { enabled: true },
});
