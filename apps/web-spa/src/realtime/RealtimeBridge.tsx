// apps/web-spa/src/realtime/RealtimeBridge.tsx
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Client } from '@stomp/stompjs';
import type { Post } from '../types/instagram';
import type { DirectMessage } from '../types/dm';
import { applyPostEvent, parsePostEvent } from '../lib/postEvents';
import { appendMessage, parseDirectMessage } from '../lib/dmEvents';
import { parseNotification } from '../lib/notificationEvents';
import { feedKey } from '../queries/posts';
import { dmKey } from '../queries/dm';
import { useConnectionStore } from '../stores/useConnectionStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useSessionStore } from '../stores/useSessionStore';
import { DM_QUEUE, NOTIFICATIONS_QUEUE, POSTS_TOPIC, stompClient } from './stompClient';

// 통로와 캐시를 잇는 자리. 그리는 것이 없어서 null 을 돌려준다.
//
// 서버가 보내온 소식을 캐시에 얹으면, 그 캐시를 보고 있는 화면은
// 우리가 아무것도 안 해도 알아서 다시 그려진다(C-6 에서 정한 "진실은 하나").
export function RealtimeBridge({ client = stompClient }: { client?: Client }) {
  const queryClient = useQueryClient();

  // 누구로 들어와 있는지가 바뀌면 통로도 다시 열어야 한다.
  // 서버는 CONNECT 때 받은 이름으로 "누구에게 보낼지" 를 가르기 때문이다.
  const username = useSessionStore((state) => state.username);

  // 이번이 첫 연결인지, 끊겼다 다시 붙는 것인지. 둘은 해야 할 일이 다르다.
  const connectedBefore = useRef(false);

  useEffect(() => {
    const { setStatus, countAttempt } = useConnectionStore.getState();
    setStatus('connecting');

    // ⚠️ client.onConnect = ... 로 대입하면 편집기가 빨간 줄을 긋는다.
    // 바깥에서 만든 것을 그리는 도중에 고치지 말라는 그 규칙이다(C-7 에서 본 것).
    // 라이브러리가 그래서 configure 를 열어뒀다 — 대입 대신 이쪽으로 넘긴다.
    client.configure({
      // 출입증을 서버에 내미는 자리. 진짜 서버는 여기서 JWT 를 검사한다.
      // 로그인 전에는 아무것도 안 싣는다 — 그래도 /topic 은 받는다.
      connectHeaders: username === null ? {} : { login: username },

      // 붙을 때마다 불린다 — 처음 붙을 때도, 끊겼다 다시 붙을 때도.
      // 그래서 구독을 여기서 한다. 다시 붙으면 구독도 다시 살아난다.
      onConnect: () => {
        setStatus('connected');

        // ★ 끊겨 있던 동안 일어난 일은 통로로 안 온다. 지나간 건 지나간 것이다.
        // 그래서 다시 붙은 순간 받아둔 것을 전부 낡은 것으로 표시해 다시 물어본다.
        //
        // 처음 붙을 때는 안 한다 — 화면이 방금 받아온 것을 또 받을 이유가 없다.
        // 실시간을 붙였다고 물어보는 방식을 버릴 수 없는 이유가 여기 있다.
        if (connectedBefore.current) {
          void queryClient.invalidateQueries();
        }
        connectedBefore.current = true;

        client.subscribe(POSTS_TOPIC, (message) => {
          const event = parsePostEvent(message.body);
          if (event === null) return;

          queryClient.setQueryData<Post[]>(feedKey(), (current) =>
            applyPostEvent(current, event),
          );
        });

        // 쪽지도 같은 자리에서 듣는다. 화면이 아니라 앱이 듣는 이유는
        // 쪽지 화면을 떠나 있는 동안에도 받아둬야 하기 때문이다.
        client.subscribe(DM_QUEUE, (message) => {
          const received = parseDirectMessage(message.body);
          if (received === null) return;

          // 얹는 방식은 좋아요와 똑같다. 진실을 캐시 한 곳에 모아뒀으니
          // 화면은 이 줄이 있는 줄도 모르고 다시 그려진다.
          queryClient.setQueryData<DirectMessage[]>(dmKey(received.conversationId), (current) =>
            appendMessage(current, received),
          );
        });

        // 알림도 나에게만 오는 소식이다. 쪽지와 같은 길, 다른 줄.
        client.subscribe(NOTIFICATIONS_QUEUE, (message) => {
          const notification = parseNotification(message.body);
          if (notification === null) return;

          useNotificationStore.getState().show(notification);
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
  }, [client, queryClient, username]);

  return null;
}
