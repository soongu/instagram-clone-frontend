// apps/web-spa/scratch/b1-jsx-syntax-error.tsx
// 형제 요소를 감싸지 않았을 때의 문법 에러 채증용 — 파싱 자체가 깨지므로 파일을 따로 둔다.
// 확인 명령: npx tsc --noEmit --ignoreConfig --strict --target es2025 --module esnext \
//            --moduleResolution bundler --jsx react-jsx --lib es2025,dom \
//            scratch/b1-jsx-syntax-error.tsx

export function TwoSiblings() {
  return (
    <h1>인스타그램</h1>
    <p>피드</p>
  );
}
