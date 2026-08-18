// apps/web-spa/src/realtime/RealtimeBridge.tsx
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Client } from '@stomp/stompjs';
import type { Post } from '../types/instagram';
import { applyPostEvent, parsePostEvent } from '../lib/postEvents';
import { feedKey } from '../queries/posts';
import { useConnectionStore } from '../stores/useConnectionStore';
import { POSTS_TOPIC, stompClient } from './stompClient';

// 통로와 캐시를 잇는 자리. 그리는 것이 없어서 null 을 돌려준다.
//
// 서버가 보내온 소식을 캐시에 얹으면, 그 캐시를 보고 있는 화면은
// 우리가 아무것도 안 해도 알아서 다시 그려진다(C-6 에서 정한 "진실은 하나").
export function RealtimeBridge({ client = stompClient }: { client?: Client }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const { setStatus, countAttempt } = useConnectionStore.getState();
    setStatus('connecting');

    // ⚠️ client.onConnect = ... 로 대입하면 편집기가 빨간 줄을 긋는다.
    // 바깥에서 만든 것을 그리는 도중에 고치지 말라는 그 규칙이다(C-7 에서 본 것).
    // 라이브러리가 그래서 configure 를 열어뒀다 — 대입 대신 이쪽으로 넘긴다.
    client.configure({
      // 붙을 때마다 불린다 — 처음 붙을 때도, 끊겼다 다시 붙을 때도.
      // 그래서 구독을 여기서 한다. 다시 붙으면 구독도 다시 살아난다.
      onConnect: () => {
        setStatus('connected');

        client.subscribe(POSTS_TOPIC, (message) => {
          const event = parsePostEvent(message.body);
          if (event === null) return;

          queryClient.setQueryData<Post[]>(feedKey(), (current) =>
            applyPostEvent(current, event),
          );
        });
      },

      // 선이 끊겼다. 라이브러리가 알아서 다시 시도하고, 우리는 표시만 바꾼다.
      onWebSocketClose: () => {
        const { status } = useConnectionStore.getState();
        if (status === 'connected') countAttempt();
        setStatus('offline');
      },
    });

    client.activate();

    return () => {
      void client.deactivate();
      useConnectionStore.getState().reset();
    };
  }, [client, queryClient]);

  return null;
}
