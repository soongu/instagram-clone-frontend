// apps/web-spa/src/data/feed.ts
import type { Post } from '../types/instagram';

// 지난 과목에서 순수 JS 로 다루던 그 배열 — 이번엔 타입이 붙었다
export const feedPosts: Post[] = [
  {
    id: 1,
    username: 'jaehoon',
    profileImageUrl: 'https://picsum.photos/seed/jaehoon/64/64',
    imageUrl: 'https://picsum.photos/seed/post1/640/640',
    mediaKind: 'image',
    content: '오늘 한강 노을이 미쳤다',
    hashtagNames: ['한강', '노을'],
    likeCount: 1240,
    commentCount: 32,
    liked: false,
    createdAt: '2026-07-20T18:30:00',
  },
  {
    id: 2,
    username: 'minji',
    profileImageUrl: 'https://picsum.photos/seed/minji/64/64',
    imageUrl: 'https://picsum.photos/seed/post2/640/640',
    mediaKind: 'carousel',
    content: '제주도 3박 4일 기록',
    hashtagNames: ['제주도', '여행'],
    likeCount: 8500,
    commentCount: 214,
    liked: true,
    createdAt: '2026-07-19T09:10:00',
  },
];
