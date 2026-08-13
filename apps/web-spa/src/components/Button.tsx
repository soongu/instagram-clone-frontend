// apps/web-spa/src/components/Button.tsx

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  // 안 적으면 'button' — form 안에서 눌러도 제출되지 않는다
  type?: 'button' | 'submit';
  // 생김새는 쓰는 쪽이 정한다
  className?: string;
  // 글자 대신 기호만 보이는 버튼은 읽어줄 이름을 따로 준다
  'aria-label'?: string;
  // 눌린 상태를 색으로만 알리면 눈으로 보는 사람만 안다
  'aria-pressed'?: boolean;
}

export function Button({
  children,
  onClick,
  disabled,
  type = 'button',
  className,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
}: ButtonProps) {
  return (
    <button
      className={className}
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
    >
      {children}
    </button>
  );
}
