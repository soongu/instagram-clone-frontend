// apps/web-spa/src/components/Card.tsx

interface CardProps {
  // 안 넘겨도 되는 자리 — 넘기지 않으면 그 자리는 그려지지 않는다
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  // 생김새는 쓰는 쪽이 정한다
  className?: string;
}

export function Card({ header, footer, children, className }: CardProps) {
  return (
    <article className={className}>
      {header}
      {children}
      {footer}
    </article>
  );
}
