// apps/web-spa/scratch/a2-story-answer.ts
// A-2 [구현] 과제 예시답안 검증용 (include 밖)

import type { Story } from './story-answer';

interface StoryFeedIdle {
  status: 'idle';
}

interface StoryFeedLoading {
  status: 'loading';
}

interface StoryFeedLoaded {
  status: 'loaded';
  stories: Story[];
}

interface StoryFeedFailed {
  status: 'failed';
  message: string;
}

export type StoryFeedState =
  | StoryFeedIdle
  | StoryFeedLoading
  | StoryFeedLoaded
  | StoryFeedFailed;

function assertNever(value: never): never {
  throw new Error(`처리하지 않은 스토리 상태입니다: ${JSON.stringify(value)}`);
}

export function storyFeedMessage(state: StoryFeedState): string {
  switch (state.status) {
    case 'idle':
      return '스토리를 불러올 준비가 됐어요';
    case 'loading':
      return '스토리를 불러오는 중이에요';
    case 'loaded':
      if (state.stories.length === 0) {
        return '아직 올라온 스토리가 없어요';
      }
      return `스토리 ${state.stories.length}개`;
    case 'failed':
      return `불러오지 못했어요 · ${state.message}`;
    default:
      return assertNever(state);
  }
}

export function isStory(value: unknown): value is Story {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'username' in value &&
    'mediaUrl' in value &&
    'background' in value &&
    'viewCount' in value &&
    typeof value.id === 'number' &&
    typeof value.username === 'string' &&
    typeof value.mediaUrl === 'string' &&
    typeof value.viewCount === 'number' &&
    (value.background === 'white' ||
      value.background === 'black' ||
      value.background === 'gradient')
  );
}
