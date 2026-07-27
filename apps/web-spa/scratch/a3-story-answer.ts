// apps/web-spa/scratch/a3-story-answer.ts
// A-3 [구현] 과제 예시답안 검증용 (include 밖)
// 확인 명령: npx tsc --noEmit --ignoreConfig --strict --target es2025 --module esnext \
//            --moduleResolution bundler --verbatimModuleSyntax scratch/a3-story-answer.ts

import type { Story, StoryBackground } from './story-answer';

// 스토리 링에는 이름과 프로필 이미지만 뜬다 — 남길 것을 적는다
export type StoryRingProps = Pick<Story, 'username' | 'profileImageUrl'>;

// 전체 화면 뷰어는 조회수만 빼고 다 쓴다 — 뺄 것을 적는다
export type StoryViewerProps = Omit<Story, 'viewCount'>;

// 올리기 전 초안은 아직 아무것도 안 정해졌을 수 있다
export type StoryDraft = Partial<Story>;

// 배경 세 가지 각각에 화면에 쓸 색상을 매단다
export const STORY_BACKGROUND_CSS: Record<StoryBackground, string> = {
  white: '#ffffff',
  black: '#000000',
  gradient: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)',
};

export function backgroundCssOf(background: StoryBackground): string {
  return STORY_BACKGROUND_CSS[background];
}

// 반환 타입을 적지 않는다
export function toStoryView(story: Story) {
  return {
    ring: `@${story.username}`,
    background: backgroundCssOf(story.background),
    hasText: story.text !== undefined,
  };
}

// 그 함수에서 타입을 꺼내 이름을 붙인다
export type StoryView = ReturnType<typeof toStoryView>;

export function storyAlt(view: StoryView): string {
  return view.hasText ? `${view.ring} 스토리 (글 있음)` : `${view.ring} 스토리`;
}

export function ringLabel(props: StoryRingProps): string {
  return `@${props.username}`;
}

// 초안을 실제 스토리에 반영한다 — 담긴 필드만 바뀐다
export function applyStoryDraft(current: Story, draft: StoryDraft): Story {
  return {
    ...current,
    ...draft,
  };
}
