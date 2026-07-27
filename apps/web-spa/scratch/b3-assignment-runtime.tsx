// B-3 과제 2 [탐구] 채증 — 조건부 훅을 실행까지 끌고 갔을 때 무슨 일이 나는가 (내부 검증용)
//
// 린트는 이 파일을 이미 막는다(scratch/b3-assignment-probes.tsx.txt 참고).
// 여기서는 "린트를 무시하고 실행까지 갔을 때" 무슨 일이 나는지 보려고
// eslint.config.js 에서 이 파일만 rules-of-hooks 를 꺼 둔다.
import { useState } from 'react';
import type { Post } from '../src/types/instagram';
import { Card } from '../src/components/Card';
import { Button } from '../src/components/Button';
import { LikeButton } from '../src/components/LikeButton';
import { PostHeader } from '../src/components/PostHeader';
import { useToggle } from '../src/hooks/useToggle';

// src/components/PostBody.tsx 와 같은 값
const CAPTION_LIMIT = 10;

interface PostBodyProps {
  username: string;
  content: string;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  onToggle: () => void;
}

// 과제 2 1단계 — useToggle 호출을 if (isLong) 블록 안으로 옮긴 PostBody
export function ConditionalPostBody({
  username,
  content,
  liked,
  likeCount,
  commentCount,
  onToggle,
}: PostBodyProps) {
  const isLong = content.length > CAPTION_LIMIT;

  if (isLong) {
    const [captionOpen, toggleCaption] = useToggle();
    const shownContent = captionOpen
      ? content
      : `${content.slice(0, CAPTION_LIMIT).trimEnd()}...`;

    return (
      <>
        <LikeButton liked={liked} likeCount={likeCount} onToggle={onToggle} />
        <p className="post-content">
          <strong>{username}</strong> {shownContent}
          <Button className="caption-toggle" onClick={toggleCaption}>
            {captionOpen ? '접기' : '더 보기'}
          </Button>
        </p>
        <p className="post-comments">댓글 {commentCount}개 모두 보기</p>
      </>
    );
  }

  return (
    <>
      <LikeButton liked={liked} likeCount={likeCount} onToggle={onToggle} />
      <p className="post-content">
        <strong>{username}</strong> {content}
      </p>
      <p className="post-comments">댓글 {commentCount}개 모두 보기</p>
    </>
  );
}

interface ProbeFeedProps {
  posts: Post[];
}

// 과제 2 2·3단계 — 규칙을 어긴 PostBody 를 얹은 피드를 그대로 그려본다
export function ProbeFeed({ posts }: ProbeFeedProps) {
  return (
    <>
      {posts.map((post) => (
        <Card
          key={post.id}
          className="post-card"
          header={
            <PostHeader
              username={post.username}
              profileImageUrl={post.profileImageUrl}
            />
          }
        >
          <ConditionalPostBody
            username={post.username}
            content={post.content}
            liked={post.liked}
            likeCount={post.likeCount}
            commentCount={post.commentCount}
            onToggle={() => {}}
          />
        </Card>
      ))}
    </>
  );
}

const LONG_CAPTION = '오늘 한강 노을이 미쳤다';
const SHORT_CAPTION = '노을';

// 과제 2 4단계 (가) — 길이 바꾸기 버튼을 카드 쪽에 둔 판.
// PostBody 가 가진 훅은 조건부 useToggle 하나뿐이라 훅 개수가 0 ↔ 1 로 오간다.
export function CaptionLengthLab({ startLong }: { startLong: boolean }) {
  const [long, setLong] = useState(startLong);

  return (
    <Card
      className="post-card"
      header={
        <Button className="caption-length" onClick={() => setLong(!long)}>
          캡션 길이 바꾸기
        </Button>
      }
    >
      <ConditionalPostBody
        username="jaehoon"
        content={long ? LONG_CAPTION : SHORT_CAPTION}
        liked={false}
        likeCount={1240}
        commentCount={32}
        onToggle={() => {}}
      />
    </Card>
  );
}

// Step 5 가 조건부 훅의 예로 든 ConditionalToggle 을 글자 그대로 옮긴 것.
// 이 컴포넌트가 가진 훅도 조건부 useState 하나뿐이다.
export function ConditionalToggle({ expandable }: { expandable: boolean }) {
  if (expandable) {
    const [open, setOpen] = useState(false);
    return <button onClick={() => setOpen(!open)}>{open ? '접기' : '더보기'}</button>;
  }

  return null;
}

// ConditionalToggle 의 expandable 을 눌러서 뒤집는 실험실
export function ConditionalToggleLab({ start }: { start: boolean }) {
  const [expandable, setExpandable] = useState(start);

  return (
    <div>
      <Button className="flip" onClick={() => setExpandable(!expandable)}>
        조건 뒤집기
      </Button>
      <ConditionalToggle expandable={expandable} />
    </div>
  );
}

// 과제 2 5단계 — 슬롯에 함수를 넘긴 Card.
// 그냥 적으면 tsc 가 먼저 막으므로(TS2322), 타입 검사를 통과시켜 놓고
// 실행 중에는 무슨 일이 나는지만 본다.
const headerAsFunction = (() => <p>jaehoon</p>) as unknown as React.ReactNode;

export function FunctionSlotCard() {
  return (
    <Card className="post-card" header={headerAsFunction}>
      노을 사진
    </Card>
  );
}

interface SelfLengthPostBodyProps {
  startLong: boolean;
}

// 과제 2 4단계 (나) — 길이 바꾸기 버튼을 PostBody 안에 둔 판.
// 캡션을 담을 useState 가 조건부 useToggle 앞에 생기면서 훅 개수가 1 ↔ 2 로 오간다.
export function SelfLengthPostBody({ startLong }: SelfLengthPostBodyProps) {
  const [content, setContent] = useState(
    startLong ? LONG_CAPTION : SHORT_CAPTION,
  );
  const isLong = content.length > CAPTION_LIMIT;

  function switchLength() {
    setContent(isLong ? SHORT_CAPTION : LONG_CAPTION);
  }

  if (isLong) {
    const [captionOpen, toggleCaption] = useToggle();
    const shownContent = captionOpen
      ? content
      : `${content.slice(0, CAPTION_LIMIT).trimEnd()}...`;

    return (
      <>
        <p className="post-content">
          <strong>jaehoon</strong> {shownContent}
          <Button className="caption-toggle" onClick={toggleCaption}>
            {captionOpen ? '접기' : '더 보기'}
          </Button>
        </p>
        <Button className="caption-length" onClick={switchLength}>
          캡션 길이 바꾸기
        </Button>
      </>
    );
  }

  return (
    <>
      <p className="post-content">
        <strong>jaehoon</strong> {content}
      </p>
      <Button className="caption-length" onClick={switchLength}>
        캡션 길이 바꾸기
      </Button>
    </>
  );
}
