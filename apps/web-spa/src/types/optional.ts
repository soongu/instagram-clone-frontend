// apps/web-spa/src/types/optional.ts

// ? 가 붙은 자리는 "없을 수도 있다"는 뜻이다
export interface ProfileSummary {
  username: string;
  bio?: string;
  websiteUrl?: string;
}

export function renderBio(profile: ProfileSummary): string {
  if (profile.bio === undefined) {
    return '소개글이 아직 없어요';
  }
  return profile.bio;
}

// ?? 를 쓰면 같은 처리를 한 줄로 줄일 수 있다
export function renderWebsite(profile: ProfileSummary): string {
  return profile.websiteUrl ?? '링크 없음';
}

export function hasCompleteProfile(profile: ProfileSummary): boolean {
  return profile.bio !== undefined && profile.websiteUrl !== undefined;
}
