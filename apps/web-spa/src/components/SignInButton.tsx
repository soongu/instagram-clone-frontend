// apps/web-spa/src/components/SignInButton.tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { login } from '../api/auth';
import { useSessionStore } from '../stores/useSessionStore';
import { Button } from './ui/button';

// 연습용 서버가 아는 사람들. 아이디·비밀번호를 받는 진짜 로그인 화면은
// 나중에 인증을 다루는 시간에 만든다. 지금은 출입증을 받아오는 일만 한다.
//
// 두 명인 이유는 쪽지 때문이다. 탭을 두 개 띄우고 각각 다른 사람으로 들어가면
// 한쪽에서 보낸 것이 다른 쪽에 뜨는 것을 볼 수 있다.
const PEOPLE = ['jaehoon', 'minji'] as const;

export function SignInButton() {
  const [selected, setSelected] = useState<string>(PEOPLE[0]);

  const username = useSessionStore((state) => state.username);
  const signInToSession = useSessionStore((state) => state.signIn);

  // 서버에 무언가를 시키는 일에도 도구가 있다. 읽기와 달리 우리가 부를 때만 나간다.
  const signIn = useMutation({
    mutationFn: () => login(selected),
    onSuccess: (user) => signInToSession(user.username),
  });

  // 들어온 뒤에는 누구로 들어와 있는지만 보여준다
  if (username !== null) {
    return (
      <span data-slot="sign-in" className="text-sm text-faint">
        {username}
      </span>
    );
  }

  return (
    <span data-slot="sign-in" className="flex items-center gap-1.5">
      <select
        aria-label="로그인할 사람"
        className="rounded-md border border-line bg-canvas px-1.5 py-1 text-xs text-ink"
        value={selected}
        onChange={(event) => setSelected(event.target.value)}
      >
        {PEOPLE.map((person) => (
          <option key={person} value={person}>
            {person} 으로
          </option>
        ))}
      </select>
      <Button variant="outline" size="sm" disabled={signIn.isPending} onClick={() => signIn.mutate()}>
        {signIn.isPending ? '보내는 중…' : '로그인'}
      </Button>
    </span>
  );
}
