// apps/web-next/lib/auth.ts
import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { username } from 'better-auth/plugins/username';

// 사람과 세션을 담아둘 곳. 지금은 서버 메모리라 서버를 끄면 사라진다.
// 표(배열)를 미리 만들어 둬야 한다 — 빈 객체를 주면 "Model user not found" 로 죽는다.
const db = { user: [], session: [], account: [], verification: [] };

export const auth = betterAuth({
  database: memoryAdapter(db),
  // 비밀번호로 로그인하겠다는 선언.
  emailAndPassword: { enabled: true },
  // 우리 앱은 이메일이 아니라 @jaehoon 같은 아이디로 사람을 부른다.
  plugins: [username()],
});

// 강의용 씨앗 계정. 저장소가 메모리라 서버를 켤 때마다 새로 심는다.
// 진짜 서비스라면 가입 화면이 이 일을 한다.
const DEMO_USERS = [
  { username: 'jaehoon', name: '재훈', password: 'hunter22!' },
  { username: 'minji', name: '민지', password: 'hunter22!' },
];

export const demoUsersReady = Promise.all(
  DEMO_USERS.map((user) =>
    auth.api
      .signUpEmail({
        body: {
          email: `${user.username}@example.com`,
          password: user.password,
          name: user.name,
          username: user.username,
        },
      })
      .catch(() => undefined),
  ),
);
