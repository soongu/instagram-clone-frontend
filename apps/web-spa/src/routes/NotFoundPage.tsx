// apps/web-spa/src/routes/NotFoundPage.tsx
import { Link, useLocation } from 'react-router';
import { Section } from '../components/Section';

// 표의 맨 끝에 서서 아무도 안 맡은 주소를 받는다.
// 오류가 아니라 우리가 맡기로 한 화면이라, 머리말이 그대로 남는다.
export function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <Section title="없는 주소">
      <h2 className="mb-2 text-xl font-bold">없는 주소예요</h2>
      <p className="mb-4 text-sm text-faint">
        <code>{pathname}</code> 은 우리 주소 표에 없습니다.
      </p>
      <Link className="text-sm underline underline-offset-4" to="/explore">
        탐색으로 가기
      </Link>
    </Section>
  );
}
