// B-3 교안·과제에 인용할 컴파일 에러 채증 (내부 검증용)
//
// 재현:
//   npx tsc --noEmit --ignoreConfig --strict --target es2025 --module esnext \
//     --moduleResolution bundler --jsx react-jsx --lib es2025,dom --skipLibCheck \
//     scratch/b3-expected-errors.tsx
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Section } from '../src/components/Section';

// 1. children 을 props 에 안 적어두고 자식을 넘긴다
interface IconButtonProps {
  onClick?: () => void;
}

function IconButton({ onClick }: IconButtonProps) {
  return <button onClick={onClick} />;
}

export function ChildrenNotDeclared() {
  return <IconButton>게시</IconButton>;
}

// 1-b. 같은 실수인데 다른 props 를 함께 넘기면 메시지가 달라진다
export function ChildrenNotDeclaredWithProp() {
  return <IconButton onClick={() => {}}>게시</IconButton>;
}

// 2. ReactNode 자리에 함수를 넘긴다 (자식을 "그리는 방법" 을 넘기려는 실수)
export function FunctionAsChildren() {
  return <Card>{() => '노을'}</Card>;
}

// 3. 이름 붙인 슬롯에 함수를 넘긴다
export function FunctionInNamedSlot() {
  return <Card header={() => <p>jaehoon</p>}>노을 사진</Card>;
}

// 4. ReactNode 자리에 순수 객체를 넘긴다
export function ObjectAsChildren() {
  return <Card>{{ username: 'jaehoon' }}</Card>;
}

// 5. 슬롯을 string 으로 좁혀 놓은 곳에 JSX 를 넘긴다 (Section 의 한계)
export function JsxIntoStringSlot() {
  return <Section title={<strong>피드</strong>}>노을 사진</Section>;
}

// 6. children 이 필수인데 안 넘긴다
export function CardWithoutChildren() {
  return <Card header={<p>jaehoon</p>} />;
}

// 7. 없는 슬롯 이름으로 넘긴다
export function UnknownSlotName() {
  return <Card side={<p>옆</p>}>노을 사진</Card>;
}

// 8. type 유니온에 없는 값을 넘긴다
export function UnknownButtonType() {
  return <Button type="reset">초기화</Button>;
}
