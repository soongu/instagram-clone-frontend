// apps/web-spa/src/components/PostBody.tsx
import { LikeButton } from './LikeButton';
import { Button } from './Button';
import { useToggle } from '../hooks/useToggle';

// 이 글자 수를 넘는 캡션은 접어서 보여준다
const CAPTION_LIMIT = 10;

interface PostBodyProps {
  username: string;
  content: string;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  onToggle: () => void;
}

// 사진 아래 본문 구역 — 좋아요·캡션·댓글 수가 함께 산다.
export function PostBody({
  username,
  content,
  liked,
  likeCount,
  commentCount,
  onToggle,
}: PostBodyProps) {
  const [captionOpen, toggleCaption] = useToggle();
  const isLong = content.length > CAPTION_LIMIT;
  const shownContent =
    isLong && !captionOpen ? `${content.slice(0, CAPTION_LIMIT).trimEnd()}...` : content;

  return (
    <>
      <LikeButton liked={liked} likeCount={likeCount} onToggle={onToggle} />
      <p className="px-3 py-1 text-sm">
        <strong>{username}</strong> {shownContent}
        {isLong && (
          <Button className="cursor-pointer pl-1 text-sm text-muted" onClick={toggleCaption}>
            {captionOpen ? '접기' : '더 보기'}
          </Button>
        )}
      </p>
      <p className="px-3 pt-1 pb-3 text-sm text-muted">댓글 {commentCount}개 모두 보기</p>
    </>
  );
}
