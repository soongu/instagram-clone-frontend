// apps/web-spa/src/routes/SignUpPage.tsx
import { useNavigate } from 'react-router';
import { Section } from '../components/Section';
import { SignUpForm } from '../components/SignUpForm';

export function SignUpPage() {
  // 훅이 돌려주는 것은 "지금 가라" 가 아니라 보내는 함수다.
  // 그래서 렌더 도중에 부르면 안 되고, 무슨 일이 끝난 뒤에 부른다.
  const navigate = useNavigate();

  return (
    <Section title="회원가입">
      <SignUpForm
        onSubmit={(values) => {
          console.log('가입 요청', values.username);

          // replace 를 빼면 가입 화면이 기록에 남는다.
          // 그러면 뒤로 가기 한 번에 방금 끝낸 폼으로 되돌아간다.
          navigate('/', { replace: true });
        }}
      />
    </Section>
  );
}
