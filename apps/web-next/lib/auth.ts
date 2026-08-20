// apps/web-next/lib/auth.ts
import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { nextCookies } from 'better-auth/next-js';
import { username } from 'better-auth/plugins/username';

// 사람과 세션을 담아둘 곳. 지금은 서버 메모리라 서버를 끄면 사라진다.
// 표(배열)를 미리 만들어 둬야 한다 — 빈 객체를 주면 "Model user not found" 로 죽는다.
//
// globalThis 에 매다는 이유: Next 는 이 파일을 한 번만 읽지 않는다.
// 화면이 쓰는 것과 주소가 쓰는 것이 따로 만들어져서, 그냥 두면 저장소가 둘이 된다.
// 그러면 로그인은 됐는데 화면은 모르는 상태가 된다.
const store = globalThis as typeof globalThis & { __authDb?: AuthDb };
type AuthDb = { user: unknown[]; session: unknown[]; account: unknown[]; verification: unknown[] };

const db = (store.__authDb ??= { user: [], session: [], account: [], verification: [] });

export const auth = betterAuth({
  database: memoryAdapter(db),
  // 비밀번호로 로그인하겠다는 선언.
  emailAndPassword: { enabled: true },
  // 남의 집 열쇠로 우리 집에 들어오는 길.
  // 진짜 열쇠는 GitHub 에 앱을 등록해야 나온다 — 없으면 강의용 가짜 값으로 둔다.
  // 가짜 값이어도 「어디로 보낼지」까지는 진짜로 만들어진다.
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? 'demo-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? 'demo-secret',
    },
  },
  // session.cookieCache 는 켜지 않는다.
  // 켜보고 잰 결과, 저장소를 비운 서버에서도 유효기간 동안은 통과했다.
  // 우리 앱에는 나가기 버튼이 있고, 나가는 순간 끝나는 쪽이 더 중요하다.
  plugins: [
    // 우리 앱은 이메일이 아니라 @jaehoon 같은 아이디로 사람을 부른다.
    username(),
    // 액션이 심은 쿠키를 응답에 실어준다. 반드시 마지막에 둔다.
    nextCookies(),
  ],
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
