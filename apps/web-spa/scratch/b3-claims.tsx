// B-3 교안 본문이 주장하는 것들을 실제로 확인 (내부 검증용)
//
// 이 파일은 전부 통과해야 한다(에러가 나면 본문 주장이 틀린 것).
// 타입은 npm run typecheck 가, 화면은 src/components/b3-claims.test.tsx 가 확인한다.
import { useState } from 'react';
import { Card } from '../src/components/Card';
import { Button } from '../src/components/Button';
import { PostHeader } from '../src/components/PostHeader';

// 주장 1 — 슬롯은 ReactNode 라서 JSX 가 아닌 값도 받는다
export function SlotTakesScalars() {
  return (
    <Card className="profile-card" header="jaehoon" footer={42}>
      노을 사진
    </Card>
  );
}

// 주장 2 — null·false 를 넘기면 그 자리는 아무것도 안 그린다
export function SlotTakesNothing() {
  const isOwner = false;

  return (
    <Card header={null} footer={isOwner && <Button>삭제</Button>}>
      노을 사진
    </Card>
  );
}

// 주장 3 — 슬롯에는 컴포넌트를 통째로 넣을 수 있다
export function SlotTakesComponent() {
  return (
    <Card header={<PostHeader username="jaehoon" profileImageUrl="/jaehoon.jpg" />}>
      노을 사진
    </Card>
  );
}

// 주장 4 — 본문에는 map 이 만든 배열도 그대로 들어간다
const hashtags = ['한강', '노을'];

export function ChildrenTakesArray() {
  return (
    <Card header="jaehoon">
      {hashtags.map((tag) => (
        <span key={tag} className="hashtag">
          #{tag}
        </span>
      ))}
    </Card>
  );
}

// 주장 5 — 슬롯에 넣은 것의 상태는 넣은 쪽에 남는다 (Card 는 배달만 한다)
export function SlotKeepsOwnerState() {
  const [likeCount, setLikeCount] = useState(0);

  return (
    <Card
      header={<p>좋아요 {likeCount}개</p>}
      footer={<Button onClick={() => setLikeCount(likeCount + 1)}>좋아요</Button>}
    >
      노을 사진
    </Card>
  );
}

// 주장 6 — 같은 Card 로 게시물이 아닌 것도 조립할 수 있다
export function ProfileCard() {
  return (
    <Card header={<h3>jaehoon</h3>} footer={<Button>팔로우</Button>}>
      <p>게시물 42 · 팔로워 1240</p>
    </Card>
  );
}
