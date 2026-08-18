// apps/web-spa/src/lib/notificationEvents.ts
import type { AppNotification } from '../types/notification';

const KINDS = ['LIKE', 'COMMENT', 'FOLLOW'] as const;

function isKind(value: unknown): value is AppNotification['type'] {
  return typeof value === 'string' && (KINDS as readonly string[]).includes(value);
}

// 통로로 온 것을 우리 타입으로 좁힌다. 모르는 종류는 버린다 —
// 서버가 나중에 새 종류를 늘려도 옛 화면이 안 깨진다.
export function parseNotification(raw: string): AppNotification | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof value !== 'object' || value === null) return null;
  const candidate = value as Record<string, unknown>;

  if (typeof candidate.notificationId !== 'number') return null;
  if (!isKind(candidate.type)) return null;
  if (typeof candidate.message !== 'string') return null;

  return {
    notificationId: candidate.notificationId,
    type: candidate.type,
    senderUsername:
      typeof candidate.senderUsername === 'string' ? candidate.senderUsername : '',
    targetId: typeof candidate.targetId === 'number' ? candidate.targetId : null,
    message: candidate.message,
    createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : '',
  };
}
