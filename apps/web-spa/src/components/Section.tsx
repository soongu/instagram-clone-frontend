// apps/web-spa/src/components/Section.tsx

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="section" aria-label={title}>
      <h2 className="section-title">{title}</h2>
      {children}
    </section>
  );
}
