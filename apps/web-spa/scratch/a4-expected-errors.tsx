// A-4 교안·과제에 인용할 컴파일 에러 채증 (내부 검증용)
//
// 재현:
//   npx tsc --noEmit --ignoreConfig --strict --target es2025 --module esnext \
//     --moduleResolution bundler --jsx react-jsx --lib es2025,dom --skipLibCheck \
//     scratch/a4-expected-errors.tsx
import { useState } from 'react';

// 1. 핸들러를 밖으로 빼고 타입을 안 적는다 (B-2 복선의 핵심)
export function HandlerWithoutType() {
  const [content, setContent] = useState('');

  function handleChange(event) {
    setContent(event.target.value);
  }

  return <input value={content} onChange={handleChange} />;
}

// 2. ChangeEvent 의 요소 타입을 틀리게 적는다
export function WrongElementForChange() {
  function handleChange(event: React.ChangeEvent<HTMLFormElement>) {
    console.log(event.target.value);
  }

  return <input onChange={handleChange} />;
}

// 3. MouseEvent 의 target 은 좁혀지지 않는다 (ChangeEvent 와의 결정적 차이)
export function MouseTargetNotNarrowed() {
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    console.log(event.target.value);
  }

  return <button onClick={handleClick}>좋아요</button>;
}

// 4. onChange 에 엉뚱한 시그니처의 핸들러를 넘긴다
export function WrongHandlerSignature() {
  function handleChange(value: string) {
    console.log(value);
  }

  return <input onChange={handleChange} />;
}

// 5. 반환 타입에 JSX.Element 를 적는다 (전역 JSX 네임스페이스가 없다)
export function AnnotatedReturn(): JSX.Element {
  return <p>안녕하세요</p>;
}

// 6. children 에 순수 객체를 넣는다
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function ObjectAsChildren() {
  return <Section title="게시물">{{ username: 'jaehoon' }}</Section>;
}

// 7. children 을 props 에 안 적어두고 자식을 넘긴다
interface BadgeProps {
  label: string;
}

function Badge({ label }: BadgeProps) {
  return <span>{label}</span>;
}

export function ChildrenNotDeclared() {
  return <Badge label="NEW">이 자식은 받을 곳이 없다</Badge>;
}

// 8. 콜백 props 의 시그니처를 어긴다
interface CommentFormProps {
  onSubmit: (content: string) => void;
}

function CommentForm({ onSubmit }: CommentFormProps) {
  return <button onClick={() => onSubmit(42)}>게시</button>;
}

export function CallbackSignatureBroken() {
  return <CommentForm onSubmit={(content) => console.log(content.trim())} />;
}

// 9. ref 를 엉뚱한 요소에 단다
interface CommentInputProps {
  ref: React.Ref<HTMLInputElement>;
}

export function RefOnWrongElement({ ref }: CommentInputProps) {
  return <textarea ref={ref} />;
}

// 10. 핸들러를 호출한 결과를 props 로 넘긴다 (함수 타입 표기의 의미)
interface LikeButtonProps {
  onToggle: () => void;
}

function LikeButton({ onToggle }: LikeButtonProps) {
  return <button onClick={onToggle}>좋아요</button>;
}

export function CallInsteadOfPass() {
  function handleToggle() {
    console.log('토글');
  }

  return <LikeButton onToggle={handleToggle()} />;
}
