// apps/web-spa/src/queries/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

// 캐시를 들고 있는 사람. React 바깥에서 한 번 만든다.
// 컴포넌트 안에서 만들면 다시 그려질 때마다 캐시가 새로 생긴다
// (main.tsx 의 라우터와 같은 이유다).
export const queryClient = new QueryClient();
