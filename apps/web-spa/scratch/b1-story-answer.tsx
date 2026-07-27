// apps/web-spa/scratch/b1-story-answer.tsx
// B-1 [구현] 과제 예시답안 검증용 (tsconfig include 밖)
// 확인 명령: npx tsc --noEmit --ignoreConfig --strict --target es2025 --module esnext \
//            --moduleResolution bundler --verbatimModuleSyntax --jsx react-jsx \
//            --lib es2025,dom --skipLibCheck scratch/b1-story-answer.tsx

import type { StoryRingProps } from './a3-story-answer';

// A-3 에서 Pick 으로 파생해 둔 타입을 그대로 입구로 쓴다 — 새로 선언하지 않는다
export function StoryRing({ username, profileImageUrl }: StoryRingProps) {
  return (
    <div className="story-ring">
      <img
        className="story-ring-image"
        src={profileImageUrl}
        alt={`${username} 스토리`}
      />
      <span className="story-ring-name">{username}</span>
    </div>
  );
}

export function StoryTray() {
  return (
    <section className="story-tray">
      <StoryRing username="jaehoon" profileImageUrl="https://picsum.photos/seed/jaehoon/64/64" />
      <StoryRing username="minji" profileImageUrl="https://picsum.photos/seed/minji/64/64" />
      <StoryRing username="seungwoo" profileImageUrl="https://picsum.photos/seed/seungwoo/64/64" />
    </section>
  );
}
