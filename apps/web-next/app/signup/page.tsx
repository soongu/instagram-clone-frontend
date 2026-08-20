// apps/web-next/app/signup/page.tsx
import { SignUpFields } from '@/app/components/SignUpFields';

// 로그인 안 한 사람이 와야 하는 주소다. 문지기가 이 사실을 알아야 한다.
export default function SignUpPage() {
  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-xl font-bold">가입</h1>
      <SignUpFields />
    </main>
  );
}
