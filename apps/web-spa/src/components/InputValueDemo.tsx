// apps/web-spa/src/components/InputValueDemo.tsx
import { useRef, useState } from 'react';
import { Button } from './Button';

// 값을 상태가 들고 있는 입력창. 화면에 보이는 글자는 언제나 nickname 이다.
// 한 글자 칠 때마다 이 함수가 다시 불리는지 콘솔로 확인한다.
export function ControlledInput() {
  console.log('상태가 값을 든 쪽이 다시 그려짐');

  const [nickname, setNickname] = useState('');

  return (
    <section className="input-demo" aria-label="상태가 값을 든 입력창">
      <h3>상태가 값을 든다</h3>
      <input
        className="input-demo-field"
        aria-label="controlled 닉네임"
        value={nickname}
        onChange={(event) => setNickname(event.target.value)}
      />
      <p>지금 값: {nickname}</p>
    </section>
  );
}

// 값을 DOM 이 들고 있는 입력창. 우리는 필요할 때 손잡이로 꺼내 온다.
export function UncontrolledInput() {
  console.log('DOM 이 값을 든 쪽이 다시 그려짐');

  const nicknameRef = useRef<HTMLInputElement>(null);
  const [readValue, setReadValue] = useState('');

  return (
    <section className="input-demo" aria-label="DOM 이 값을 든 입력창">
      <h3>DOM 이 값을 든다</h3>
      <input
        className="input-demo-field"
        aria-label="uncontrolled 닉네임"
        defaultValue=""
        ref={nicknameRef}
      />
      <Button onClick={() => setReadValue(nicknameRef.current?.value ?? '')}>값 읽기</Button>
      <p>읽어온 값: {readValue}</p>
    </section>
  );
}

// 두 입력창을 나란히 놓고 같은 글자를 쳐보는 화면이다.
export function InputValueDemo() {
  return (
    <div className="input-demo-pair">
      <ControlledInput />
      <UncontrolledInput />
    </div>
  );
}
