// apps/web-spa/src/components/Button.tsx

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  // 안 적으면 'button' — form 안에서 눌러도 제출되지 않는다
  type?: 'button' | 'submit';
  // 생김새는 쓰는 쪽이 정한다
  className?: string;
}

export function Button({
  children,
  onClick,
  disabled,
  type = 'button',
  className,
}: ButtonProps) {
  return (
    <button className={className} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
