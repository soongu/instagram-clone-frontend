export type StoryBackground = 'white' | 'black' | 'gradient';

interface StoryBackgroundMap {
  WHITE: StoryBackground;
  BLACK: StoryBackground;
  GRADIENT: StoryBackground;
}

export const STORY_BACKGROUND = {
  WHITE: 'white',
  BLACK: 'black',
  GRADIENT: 'gradient',
} as const satisfies StoryBackgroundMap;

export interface Story {
  id: number;
  username: string;
  profileImageUrl: string;
  mediaUrl: string;
  text?: string;
  background: StoryBackground;
  viewCount: number;
  createdAt: string;
}

export function storySummary(story: Story): string {
  return `@${story.username} · 조회 ${formatViewCount(story.viewCount)}`;
}

function formatViewCount(count: number): string {
  if (count >= 1000) {
    return `${Math.floor(count / 100) / 10}천`;
  }
  return String(count);
}
