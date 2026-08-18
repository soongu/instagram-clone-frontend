// apps/web-spa/src/components/RawSocketDemo.tsx
import { useEffect, useRef, useState } from 'react';

export const RAW_SOCKET_URL = 'ws://localhost:8090/ws-raw';

interface RawSocketDemoProps {
  // 테스트에서 갈아 끼울 수 있게 열어둔다. 화면에서는 기본값을 쓴다.
  createSocket?: () => WebSocket;
}

export function RawSocketDemo({ createSocket }: RawSocketDemoProps) {
  const [log, setLog] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = createSocket === undefined ? new WebSocket(RAW_SOCKET_URL) : createSocket();
    socketRef.current = socket;

    socket.onopen = () => setOpen(true);
    socket.onclose = () => setOpen(false);

    // 오는 것은 문자열 하나뿐이다. 무슨 종류인지, 누구에게 온 것인지,
    // 어디에 대한 답인지 알려주는 자리가 없다.
    socket.onmessage = (event: MessageEvent<string>) => {
      setLog((current) => [...current, event.data]);
    };

    return () => socket.close();
  }, [createSocket]);

  return (
    <section className="space-y-3">
      <p className="text-sm text-faint">연결 상태: {open ? '열림' : '닫힘'}</p>

      <button
        type="button"
        onClick={() => socketRef.current?.send('안녕하세요')}
        className="rounded-md border px-3 py-1 text-sm"
      >
        보내기
      </button>

      <ul className="space-y-1 text-sm">
        {log.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
