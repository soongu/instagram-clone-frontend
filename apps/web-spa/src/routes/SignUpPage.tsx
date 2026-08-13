// apps/web-spa/src/routes/SignUpPage.tsx
import { Section } from '../components/Section';
import { SignUpForm } from '../components/SignUpForm';

export function SignUpPage() {
  return (
    <Section title="회원가입">
      <SignUpForm onSubmit={(values) => console.log('가입 요청', values.username)} />
    </Section>
  );
}
