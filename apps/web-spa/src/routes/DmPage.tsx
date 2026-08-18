// apps/web-spa/src/routes/DmPage.tsx
import { useState } from 'react';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import type { Client } from '@stomp/stompjs';
import { messagesQuery } from '../queries/dm';
import { useSessionStore } from '../stores/useSessionStore';
import { DM_SEND, stompClient } from '../realtime/stompClient';
import { Button } from '../components/ui/button';

export function DmPage({ client = stompClient }: { client?: Client }) {
  const { conversationId } = useParams();
  const roomId = Number(conversationId);

  const username = useSessionStore((state) => state.username);

  // 통로가 열리기 전에 오간 것은 여기로 받는다.
  // 통로는 이 캐시에 얹기만 하니, 화면은 어느 쪽으로 온 것인지 몰라도 된다.
  const { data: messages, isPending } = useQuery(messagesQuery(roomId));

  const [draft, setDraft] = useState('');

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

      {isPending ? (
        <p className="text-sm text-faint">쪽지를 불러오는 중이에요…</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {messages?.map((message) => (
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
      )}

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
