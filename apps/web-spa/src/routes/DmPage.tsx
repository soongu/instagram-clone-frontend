// apps/web-spa/src/routes/DmPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import type { Client } from '@stomp/stompjs';
import type { PendingMessage } from '../types/dm';
import { parseStompError } from '../lib/dmEvents';
import { messagesQuery } from '../queries/dm';
import { useConnectionStore } from '../stores/useConnectionStore';
import { useSessionStore } from '../stores/useSessionStore';
import { DM_SEND, ERRORS_QUEUE, stompClient } from '../realtime/stompClient';
import { Button } from '../components/ui/button';

export function DmPage({ client = stompClient }: { client?: Client }) {
  const { conversationId } = useParams();
  const roomId = Number(conversationId);

  const username = useSessionStore((state) => state.username);
  const status = useConnectionStore((state) => state.status);

  // 통로가 열리기 전에 오간 것은 여기로 받는다.
  // 통로는 이 캐시에 얹기만 하니, 화면은 어느 쪽으로 온 것인지 몰라도 된다.
  const { data: messages, isPending: loadingHistory } = useQuery(messagesQuery(roomId));

  const [draft, setDraft] = useState('');
  const [outgoing, setOutgoing] = useState<PendingMessage[]>([]);

  // 보내기가 거절당하면 그 답은 정상 쪽지와 다른 줄로 온다.
  //
  // 쪽지는 앱이 듣고 이건 화면이 듣는다. 기준은 "그 소식이 화면을 떠나 있는 동안에도
  // 필요한가" 다. 쪽지는 필요하고, 내가 이 화면에서 보낸 것의 실패는 여기서만 쓸모가 있다.
  useEffect(() => {
    if (status !== 'connected') return;

    const subscription = client.subscribe(ERRORS_QUEUE, (message) => {
      const error = parseStompError(message.body);
      if (error === null || error.clientId === null) return;

      setOutgoing((current) =>
        current.map((it) =>
          it.clientId === error.clientId ? { ...it, failedReason: error.message } : it,
        ),
      );
    });

    return () => subscription.unsubscribe();
  }, [client, status]);

  if (username === null) {
    return <p className="text-sm text-faint">쪽지를 보려면 먼저 로그인해주세요.</p>;
  }

  // 서버가 우리 표를 그대로 실어 돌려준 것들. 이것들은 확인이 끝났다.
  const confirmed = new Set(messages?.map((it) => it.clientId).filter((it) => it !== undefined));
  const stillOutgoing = outgoing.filter((it) => !confirmed.has(it.clientId));

  function send() {
    const content = draft.trim();
    if (content === '') return;

    // 통로에는 응답이 없다. 그래서 우리가 표를 붙여 보내고,
    // 서버가 그 표를 그대로 실어 돌려주는 것을 "갔다" 의 증거로 삼는다.
    const clientId = crypto.randomUUID();

    client.publish({
      destination: DM_SEND,
      body: JSON.stringify({ conversationId: roomId, content, clientId }),
    });

    setOutgoing((current) => [...current, { clientId, content, failedReason: null }]);
    setDraft('');
  }

  return (
    <section aria-label="쪽지" className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">쪽지</h2>

      {loadingHistory ? (
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

          {/* 아직 확인을 못 받은 것들. 서버가 돌려주면 위 목록으로 옮겨간다. */}
          {stillOutgoing.map((it) => (
            <li
              key={it.clientId}
              className="self-end rounded-2xl bg-ink/60 px-3 py-2 text-sm text-canvas"
            >
              {it.content}
              <span className="ml-1.5 text-[0.7rem] opacity-80">
                {it.failedReason === null ? '보내는 중…' : `안 갔어요 — ${it.failedReason}`}
              </span>
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
        <Button type="submit" size="sm" disabled={status !== 'connected'}>
          보내기
        </Button>
      </form>
    </section>
  );
}
