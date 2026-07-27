// apps/web-spa/src/types/derived.ts

import { Post } from './instagram';
import { ProfileSummary } from './optional';
import { mediaBadge } from './literals';

// 프로필 그리드 한 칸에는 이미지와 종류 배지만 있으면 된다 — 남길 것을 적는다
export type PostThumbnail = Pick<Post, 'id' | 'imageUrl' | 'mediaKind'>;

// 카드는 해시태그 목록과 원본 시각 문자열을 쓰지 않는다 — 뺄 것을 적는다
export type PostCardProps = Omit<Post, 'hashtagNames' | 'createdAt'>;

// 사진에는 배지를 붙이지 않는다
export function thumbnailBadge(thumb: PostThumbnail): string | null {
  if (thumb.mediaKind === 'image') {
    return null;
  }
  return mediaBadge(thumb.mediaKind);
}

// hashtagNames·createdAt 은 이 타입에 없으니 여기서 꺼내 쓸 수 없다
export function cardHeadline(props: PostCardProps): string {
  return `@${props.username} · 좋아요 ${props.likeCount}`;
}

// 수정 폼은 바꾼 필드만 보낸다 — 물음표를 전부 붙인 모양
export type ProfileEditDraft = Partial<ProfileSummary>;

// 반대로 물음표를 전부 걷어내면 빠짐없이 채워진 모양이 된다
export type CompleteProfile = Required<ProfileSummary>;

export function applyProfileEdit(
  current: CompleteProfile,
  draft: ProfileEditDraft,
): CompleteProfile {
  return {
    username: draft.username ?? current.username,
    bio: draft.bio ?? current.bio,
    websiteUrl: draft.websiteUrl ?? current.websiteUrl,
  };
}

// 통과하면 물음표가 없는 모양으로 다뤄도 된다
export function isProfileComplete(profile: ProfileSummary): profile is CompleteProfile {
  return profile.bio !== undefined && profile.websiteUrl !== undefined;
}

// 반환 타입을 따로 선언하지 않은 함수
export function toCardView(post: Post) {
  return {
    headline: `@${post.username}`,
    caption: post.content,
    likeLabel: `좋아요 ${post.likeCount}`,
    commentLabel: `댓글 ${post.commentCount}`,
  };
}

// 함수가 무엇을 돌려주는지에서 타입을 꺼낸다 — 여기서 typeof 는 값을 가리키는 표시다
export type CardView = ReturnType<typeof toCardView>;

// 대괄호로 타입 안의 필드 하나를 꺼낸다
export type LikeCount = Post['likeCount'];

// bio 는 string | undefined — 없음을 걷어내면 string 만 남는다
export type Bio = NonNullable<ProfileSummary['bio']>;

export function cardAlt(view: CardView): string {
  return `${view.headline} — ${view.caption}`;
}

export function bioBadge(bio: Bio): string {
  return `소개글 ${bio.length}자`;
}
