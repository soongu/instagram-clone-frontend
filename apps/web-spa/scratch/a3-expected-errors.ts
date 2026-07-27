// apps/web-spa/scratch/a3-expected-errors.ts
// 교안에 인용할 "일부러 어겼을 때의 에러 메시지" 채증용.
// tsconfig 의 include 는 ["src"] 라 이 파일은 타입체크 대상이 아니다.
// 확인 명령: npx tsc --noEmit --ignoreConfig --strict --target es2025 --module esnext \
//            --moduleResolution bundler scratch/a3-expected-errors.ts

import type { Post } from '../src/types/instagram';
import type { FeedSort } from '../src/types/literals';
import type { PostStatus } from '../src/types/enum-alternative';
import type { ProfileSummary } from '../src/types/optional';
import type {
  PostThumbnail,
  PostCardProps,
  CompleteProfile,
  ProfileEditDraft,
} from '../src/types/derived';
import { annotatedOption, isLatestOnly } from '../src/types/assertions';

// [Step 1] Pick 으로 고르지 않은 필드는 없다
export function badThumbnailCaption(thumb: PostThumbnail): string {
  return thumb.content;
}

// [Step 1] Omit 으로 뺀 필드도 없다
export function badCardHashtags(props: PostCardProps): string {
  return props.hashtagNames.join(' ');
}

// [Step 1] 손으로 쓴 중복 타입은 원본이 바뀌어도 따라오지 않는다 — 파생은 따라온다
export function badThumbnailShape(): PostThumbnail {
  return { id: 1, imageUrl: 'a.jpg' };
}

// [Step 2] Partial 은 모든 필드를 없을 수도 있게 만든다
export function badDraftUsername(draft: ProfileEditDraft): number {
  return draft.username.length;
}

// [Step 2] Required 는 옵셔널을 전부 필수로 바꾼다
export function badCompleteProfile(): CompleteProfile {
  return { username: 'jaehoon' };
}

// [Step 3] Record 는 키를 하나라도 빠뜨리면 막는다
export const BAD_SORT_LABEL: Record<FeedSort, string> = {
  latest: '최신순',
  popular: '인기순',
};

// [Step 3] Record 에 없는 키를 넣어도 막는다
export const BAD_STATUS_LABEL: Record<PostStatus, string> = {
  draft: '임시저장',
  published: '공개됨',
  archived: '보관됨',
  deleted: '삭제됨',
};

// [Step 4] NonNullable 없이 옵셔널 필드 타입을 그대로 쓰면
export function badBioBadge(bio: ProfileSummary['bio']): string {
  return `소개글 ${bio.length}자`;
}

// [Step 5] 애너테이션을 쓰면 리터럴이 넓어져서 좁은 자리에 못 들어간다
export function badAnnotatedNarrow(): boolean {
  return isLatestOnly(annotatedOption.sort);
}

// [Step 5] as 도 아무 타입으로나 우길 수는 없다
export function badAssertion(): Post {
  return 42 as Post;
}
