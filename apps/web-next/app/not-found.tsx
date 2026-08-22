// apps/web-next/app/not-found.tsx
//
// 이 화면은 [locale] 폴더 «밖» 에 있다.
// 주소에 언어 칸이 없는 요청까지 여기로 오기 때문에, 이 화면만은 언어를 모른다.
// 그래서 언어를 아는 Link 를 쓸 수 없고 평범한 a 태그로 돌아간다.
//
// 이 파일 하나가 두 가지를 받는다.
// 1. 아무 폴더도 안 맡은 주소   2. notFound() 를 부른 화면
export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-2 text-xl font-bold">없는 주소예요</h1>
      <p className="mb-4 text-black/60">주소를 다시 확인해주세요.</p>
      {/* 린터는 여기에 Link 를 쓰라고 한다. 그런데 이 화면은 언어를 모른다 —
          Link 를 쓰려면 /ko 인지 /en 인지를 여기서 정해버려야 한다.
          "/" 로 통째로 이동하면 그 판단을 문지기에게 넘길 수 있다. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="underline">
        피드로 돌아가기
      </a>
    </main>
  );
}
