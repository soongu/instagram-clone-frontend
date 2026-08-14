// apps/web-spa/src/components/SignInButton.tsx
import { useMutation } from '@tanstack/react-query';
import { login } from '../api/auth';
import { Button } from './ui/button';

// 연습용 서버가 아는 사람은 한 명뿐이다. 아이디·비밀번호를 받는 진짜 로그인 화면은
// 나중에 인증을 다루는 시간에 만든다. 지금은 출입증을 받아오는 일만 한다.
const ME = 'jaehoon';

export function SignInButton() {
  // 서버에 무언가를 시키는 일에도 도구가 있다. 읽기와 달리 우리가 부를 때만 나간다.
  const signIn = useMutation({
    mutationFn: () => login(ME),
  });

  // 받아온 뒤에는 누구로 들어와 있는지만 보여준다
  if (signIn.data !== undefined) {
    return <span className="text-sm text-faint">{signIn.data.username}</span>;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={signIn.isPending}
      onClick={() => signIn.mutate()}
    >
      {signIn.isPending ? '보내는 중…' : '로그인'}
    </Button>
  );
}
