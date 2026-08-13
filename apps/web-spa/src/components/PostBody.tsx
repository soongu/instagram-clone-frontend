// apps/web-spa/src/components/PostBody.tsx
import { LikeButton } from './LikeButton';
import { Button } from './Button';
import { PostModal } from './PostModal';
import { useToggle } from '../hooks/useToggle';

// 이 글자 수를 넘는 캡션은 접어서 보여준다
const CAPTION_LIMIT = 10;

interface PostBodyProps {
  username: string;
  profileImageUrl: string;
  imageUrl: string;
  content: string;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  onToggle: () => void;
  // 지나가기만 한다 — 이 컴포넌트는 주소를 모른다
  modalOpen?: boolean;
  onModalOpenChange?: (open: boolean) => void;
}

// 사진 아래 본문 구역 — 좋아요·캡션·댓글 수가 함께 산다.
export function PostBody({
  username,
  profileImageUrl,
  imageUrl,
  content,
  liked,
  likeCount,
  commentCount,
  onToggle,
  modalOpen,
  onModalOpenChange,
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
          <Button
            className="cursor-pointer pl-1 text-sm text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={toggleCaption}
          >
            {captionOpen ? '접기' : '더 보기'}
          </Button>
        )}
      </p>
      <PostModal
        username={username}
        profileImageUrl={profileImageUrl}
        imageUrl={imageUrl}
        content={content}
        likeCount={likeCount}
        commentCount={commentCount}
        open={modalOpen}
        onOpenChange={onModalOpenChange}
      />
    </>
  );
}
