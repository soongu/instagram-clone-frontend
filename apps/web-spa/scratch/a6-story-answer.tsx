// apps/web-spa/scratch/a6-story-answer.tsx
// A-6 과제 1 예시답안 채증 — 해시태그 목록을 제네릭 List 로.
// 문자열 배열에는 id 가 없어서, 그리기 직전에 id 를 붙여 넘긴다.
import { List } from '../src/components/List';

interface HashtagListProps {
  names: string[];
}

export function HashtagList({ names }: HashtagListProps) {
  // List 는 id 가 있는 것만 받는다. 문자열에는 id 가 없으니 여기서 붙여준다.
  // 순서가 곧 신원이라 index 를 써도 되는 드문 경우다 — 이 목록은 더하거나 지우지 않는다.
  const tags = names.map((name, index) => ({ id: index, name }));

  return (
    <List
      items={tags}
      className="hashtag-list"
      aria-label="해시태그"
      renderItem={(tag) => <span className="hashtag">#{tag.name}</span>}
    />
  );
}
