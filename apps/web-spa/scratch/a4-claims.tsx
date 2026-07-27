// A-4 교안 본문·과제가 주장하는 것들을 실제로 확인 (내부 검증용)
//
// 재현:
//   npx tsc --noEmit --ignoreConfig --strict --target es2025 --module esnext \
//     --moduleResolution bundler --jsx react-jsx --lib es2025,dom --skipLibCheck \
//     scratch/a4-claims.tsx
//
// 주장 1·2·5 는 에러가 나야 하고, 3·4·6·7 은 통과해야 한다.

// 주장 1 (과제 탐구 2 전반) — currentTarget 은 우리가 적은 요소로 좁혀진다 → 통과해야 함
export function CurrentTargetIsNarrowed() {
  function handleDoubleClick(event: React.MouseEvent<HTMLImageElement>) {
    console.log(event.currentTarget.src);
  }

  return <img src="/a.jpg" alt="" onDoubleClick={handleDoubleClick} />;
}

// 주장 2 (과제 탐구 2 후반) — MouseEvent 의 target 은 안 좁혀진다 → 에러 나야 함
export function TargetIsNotNarrowed() {
  function handleDoubleClick(event: React.MouseEvent<HTMLImageElement>) {
    console.log(event.target.src);
  }

  return <img src="/a.jpg" alt="" onDoubleClick={handleDoubleClick} />;
}

// 주장 3 (Step 3 다이어그램) — 인자를 더 요구하는 함수는 거절 → 에러 나야 함
export function TooManyParams() {
  function handleClick(event: React.MouseEvent<HTMLButtonElement>, extra: string) {
    console.log(event.type, extra);
  }

  return <button onClick={handleClick}>좋아요</button>;
}

// 주장 4 (Step 3) — 매개변수를 안 받는 함수는 onClick 에 들어간다 → 통과해야 함
export function NoParamsIsFine() {
  function handleClick() {
    console.log('눌렸다');
  }

  return <button onClick={handleClick}>좋아요</button>;
}

// 주장 5 (Step 5 🙋) — 화살표 함수로 선언해도 된다 → 통과해야 함
interface AvatarProps {
  username: string;
}

export const AvatarArrow = ({ username }: AvatarProps) => {
  return <span>{username}</span>;
};

// 주장 6 (Step 5) — React.JSX.Element 로는 반환 타입을 적을 수 있다 → 통과해야 함
export function AnnotatedWithReactJsx({ username }: AvatarProps): React.JSX.Element {
  return <span>{username}</span>;
}

// 주장 8 (Step 1 🙋) — import type 으로 가져와도 똑같이 동작한다 → 통과해야 함
import type { ChangeEvent } from 'react';
import { useState } from 'react';

export function ImportedEventType() {
  const [content, setContent] = useState('');

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setContent(event.target.value);
  }

  return <input value={content} onChange={handleChange} />;
}

// 주장 7 (Step 6) — ReactNode 는 문자열·숫자·null 을 받는다 → 통과해야 함
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section aria-label={title}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function NodeAcceptsScalars() {
  return (
    <>
      <Section title="문자열">그냥 문자열</Section>
      <Section title="숫자">{42}</Section>
      <Section title="빈 것">{null}</Section>
    </>
  );
}
