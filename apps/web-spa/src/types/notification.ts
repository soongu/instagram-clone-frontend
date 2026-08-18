// apps/web-spa/src/types/notification.ts

// 나에게만 오는 소식. 남이 내 게시물에 무언가를 했을 때 온다.
export interface AppNotification {
  notificationId: number;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW';
  senderUsername: string;
  targetId: number | null;
  message: string;
  createdAt: string;
}
