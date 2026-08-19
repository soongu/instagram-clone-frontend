// apps/web-next/lib/config.ts

// 백엔드 주소는 실행하는 곳마다 다르다.
// 내 노트북에서는 localhost 지만 컨테이너 안에서 localhost 는 컨테이너 자신이다.
// 그래서 값을 코드에 박지 않고 밖에서 받는다 — 못 받으면 개발용 주소를 쓴다.
export const API_BASE = process.env.API_BASE ?? 'http://localhost:8090/api';
