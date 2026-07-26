// apps/web-spa/src/types/instagram.ts

import { MediaKind } from './literals';

/** 프로필 화면에 뜨는 사용자 */
export interface User {
  id: number;
  username: string;
  profileImageUrl: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
}

/** 피드 한 장 — 백엔드가 내려주는 이름을 그대로 받는다 */
export interface Post {
  id: number;
  username: string;
  profileImageUrl: string;
  imageUrl: string;
  mediaKind: MediaKind;
  content: string;
  hashtagNames: string[];
  likeCount: number;
  commentCount: number;
  liked: boolean;
  createdAt: string;
}

/** 게시물에 달리는 댓글 */
export interface Comment {
  id: number;
  postId: number;
  username: string;
  content: string;
  createdAt: string;
}

export function feedSummary(post: Post): string {
  return `@${post.username} · 좋아요 ${post.likeCount} · 댓글 ${post.commentCount}`;
}

export function isPopular(post: Post): boolean {
  return post.likeCount >= 1000;
}

export function commentsOf(comments: Comment[], postId: number): Comment[] {
  return comments.filter((comment) => comment.postId === postId);
}
