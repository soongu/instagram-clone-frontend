// apps/web-spa/src/components/Section.tsx

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section aria-label={title}>
      <h2 className="mb-3 text-sm font-semibold text-faint">{title}</h2>
      {children}
    </section>
  );
}
