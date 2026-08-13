// apps/web-spa/src/routes/SignUpPage.tsx
import { Section } from '../components/Section';
import { SignUpForm } from '../components/SignUpForm';
import { ThemeToggle } from '../components/ThemeToggle';

export function SignUpPage() {
  return (
    <main className="@container mx-auto max-w-[996px] py-4 sm:px-4">
      <header className="mb-4 flex items-baseline justify-between">
        <h1 className="mb-4 text-2xl font-bold">인스타그램</h1>
        <ThemeToggle />
      </header>
      <Section title="회원가입">
        <SignUpForm onSubmit={(values) => console.log('가입 요청', values.username)} />
      </Section>
    </main>
  );
}
