export type StoryBackground = 'white' | 'black' | 'gradient';

// A-3 에서 손으로 쓰던 StoryBackgroundMap 을 Record 로 대체
export const STORY_BACKGROUND = {
  WHITE: 'white',
  BLACK: 'black',
  GRADIENT: 'gradient',
} as const satisfies Record<Uppercase<StoryBackground>, StoryBackground>;

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
