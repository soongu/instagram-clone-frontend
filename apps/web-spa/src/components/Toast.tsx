// apps/web-spa/src/components/Toast.tsx

interface ToastProps {
  message: string;
}

// 잠깐 떴다가 사라지는 알림 한 줄.
// 언제 사라질지는 이 컴포넌트가 정하지 않는다 — 띄운 쪽이 정한다.
export function Toast({ message }: ToastProps) {
  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-[20px] bg-black/82 px-4.5 py-2.5 text-sm text-white"
      role="status"
    >
      {message}
    </div>
  );
}
