// apps/web-spa/scratch/b1-expected-errors.tsx
// 교안에 인용할 "일부러 어겼을 때의 에러 메시지" 채증용.
// tsconfig 의 include 는 ["src", "vite.config.ts"] 라 이 파일은 타입체크 대상이 아니다.
// 확인 명령: npx tsc --noEmit --ignoreConfig --strict --target es2025 --module esnext \
//            --moduleResolution bundler --jsx react-jsx --lib es2025,dom \
//            scratch/b1-expected-errors.tsx

import { Avatar } from '../src/components/Avatar';
import { PostCard } from '../src/components/PostCard';
import { feedPosts } from '../src/data/feed';

const [post] = feedPosts;

// ── 1. 필수 props 를 빠뜨린다 (하나) → TS2741
export const missingProp = <Avatar username="jaehoon" />;

// ── 2. props 에 다른 타입의 값을 넣는다 → TS2322
export const wrongType = (
  <Avatar username={7} profileImageUrl="https://example.com/a.jpg" />
);

// ── 3. props 이름에 오타를 낸다 → TS2322 + Did you mean 제안
export const typoProp = (
  <Avatar usernam="jaehoon" profileImageUrl="https://example.com/a.jpg" />
);

// ── 4. 타입에 없는 props 를 넘긴다 → TS2322
export const extraProp = (
  <Avatar
    username="jaehoon"
    profileImageUrl="https://example.com/a.jpg"
    followerCount={1240}
  />
);

// ── 5. className 대신 HTML 의 class 를 쓴다 → TS2322
export const htmlClass = <div class="feed">피드</div>;

// ── 6. PostCard 에 필요한 props 를 여럿 빠뜨린다 → TS2740
export const partialPost = <PostCard username={post.username} />;

// ── 7. 컴포넌트 이름을 소문자로 쓴다 → TS2339 (HTML 태그로 취급된다)
export const lowercase = <postCard />;
