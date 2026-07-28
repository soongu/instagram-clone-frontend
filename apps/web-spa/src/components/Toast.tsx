// apps/web-spa/src/components/Toast.tsx

interface ToastProps {
  message: string;
}

// 잠깐 떴다가 사라지는 알림 한 줄.
// 언제 사라질지는 이 컴포넌트가 정하지 않는다 — 띄운 쪽이 정한다.
export function Toast({ message }: ToastProps) {
  return (
    <div className="toast" role="status">
      {message}
    </div>
  );
}
