// apps/web-next/app/not-found.tsx
import Link from 'next/link';

// 이 파일 하나가 두 가지를 받는다.
// 1. 아무 폴더도 안 맡은 주소   2. notFound() 를 부른 화면
export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-2 text-xl font-bold">없는 주소예요</h1>
      <p className="mb-4 text-black/60">주소를 다시 확인해주세요.</p>
      <Link href="/" className="underline">
        피드로 돌아가기
      </Link>
    </main>
  );
}
