// C-5 이후 서버 값을 읽는 컴포넌트를 홀로 그려보는 도우미 (내부 검증용)
//
// Step 6 에서 화면이 useQuery 를 쓰게 됐다. 캐시를 넣어주는 쪽이 없으면
// 훅이 아예 못 돈다 — withRouter·withTheme 와 같은 성격으로 문맥만 씌운다.
//
// ⚠️ 테스트마다 새 QueryClient 를 만든다. 앱의 것을 함께 쓰면 앞 테스트가
// 받아둔 값이 다음 테스트로 새어 "왜 요청이 안 나가지" 가 된다.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function freshQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      // 테스트에서 실패를 재려면 다시 시도하지 않아야 한다.
      // 기본값(3회)이면 한 번 실패한 판이 초록으로 끝난다.
      queries: { retry: false },
    },
  });
}

export function withQuery(ui: React.ReactNode, client: QueryClient = freshQueryClient()) {
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}
