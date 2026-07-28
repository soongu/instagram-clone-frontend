// A-6 교안·과제에 인용할 컴파일 에러 채증 (내부 검증용)
//
// 재현:
//   npx tsc --noEmit --ignoreConfig --strict --target es2025 --module esnext \
//     --moduleResolution bundler --jsx react-jsx --lib es2025,dom --skipLibCheck \
//     scratch/a6-expected-errors.tsx
import { List } from '../src/components/List';
import { IconButton } from '../src/components/IconButton';
import { findById } from '../src/lib/collections';

// ── Step 1 ─ 제약이 없으면 안을 들여다볼 수 없다 ───────────────

// 제약을 안 걸면 T 에 무엇이 올지 모르니 id 를 꺼낼 수 없다
export function findByIdUnconstrained<T>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

// 제약을 어긴 목록을 넘기면 부르는 쪽에서 걸린다
export function callWithoutId() {
  const tags = [{ name: '한강' }, { name: '노을' }];

  return findById(tags, 1);
}

// ── Step 2 ─ 제네릭 컴포넌트 ─────────────────────────────────

// id 가 없는 목록은 List 에 넣을 수 없다
export function ListWithoutId() {
  const tags = [{ name: '한강' }];

  return <List items={tags} renderItem={(tag) => <span>{tag.name}</span>} />;
}

// renderItem 이 받는 것은 items 에서 흘러온다 — 없는 필드는 못 꺼낸다
export function ListWrongField() {
  const comments = [{ id: 1, content: '노을' }];

  return <List items={comments} renderItem={(comment) => <span>{comment.username}</span>} />;
}

// ── Step 3 ─ ComponentProps 로 물려받은 뒤 좁힌 것 ─────────────

// aria-label 을 빼면 걸린다. 감싸기 전 Button 이었다면 통과했을 자리다.
export function IconWithoutLabel() {
  return <IconButton>×</IconButton>;
}

// 물려받은 props 는 그대로 쓸 수 있다 — 없는 props 는 여전히 막힌다
export function IconWithUnknownProp() {
  return (
    <IconButton aria-label="닫기" href="/home">
      ×
    </IconButton>
  );
}
