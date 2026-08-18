// apps/web-spa/src/routes/DmPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import type { Client } from '@stomp/stompjs';
import type { DirectMessage } from '../types/dm';
import { appendMessage, parseDirectMessage } from '../lib/dmEvents';
import { useConnectionStore } from '../stores/useConnectionStore';
import { useSessionStore } from '../stores/useSessionStore';
import { DM_QUEUE, DM_SEND, stompClient } from '../realtime/stompClient';
import { Button } from '../components/ui/button';

export function DmPage({ client = stompClient }: { client?: Client }) {
  const { conversationId } = useParams();
  const roomId = Number(conversationId);

  const username = useSessionStore((state) => state.username);

  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [draft, setDraft] = useState('');

  // 붙기 전에는 구독도 못 한다. 지난 시간에 담아둔 연결 상태가 여기서 쓰인다.
  const status = useConnectionStore((state) => state.status);

  useEffect(() => {
    if (status !== 'connected') return;

    // 이 줄은 누가 들어와 있든 글자 하나 안 다르다.
    // 그런데 도착하는 것은 사람마다 다르다 — 가르는 쪽이 서버이기 때문이다.
    const subscription = client.subscribe(DM_QUEUE, (message) => {
      const received = parseDirectMessage(message.body);
      if (received === null || received.conversationId !== roomId) return;

      setMessages((current) => appendMessage(current, received));
    });

    // 화면을 떠나면 구독을 거둔다. 연결은 그대로 두고 이 줄만 끊는 것이다.
    return () => subscription.unsubscribe();
  }, [client, roomId, status]);

  if (username === null) {
    return <p className="text-sm text-faint">쪽지를 보려면 먼저 로그인해주세요.</p>;
  }

  function send() {
    const content = draft.trim();
    if (content === '') return;

    // 요청이 아니라 통로로 보낸다. 보내는 사람은 우리가 적지 않는다.
    client.publish({
      destination: DM_SEND,
      body: JSON.stringify({ conversationId: roomId, content }),
    });

    setDraft('');
  }

  return (
    <section aria-label="쪽지" className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">쪽지</h2>

      <ul className="flex flex-col gap-2">
        {messages.map((message) => (
          <li
            key={message.messageId}
            className={
              message.senderUsername === username
                ? 'self-end rounded-2xl bg-ink px-3 py-2 text-sm text-canvas'
                : 'self-start rounded-2xl bg-line-soft px-3 py-2 text-sm text-ink'
            }
          >
            <span className="sr-only">{message.senderUsername} 님의 쪽지: </span>
            {message.content}
          </li>
        ))}
      </ul>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <input
          aria-label="보낼 쪽지"
          className="flex-1 rounded-md border border-line bg-canvas px-2 py-1.5 text-sm"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button type="submit" size="sm">
          보내기
        </Button>
      </form>
    </section>
  );
}
