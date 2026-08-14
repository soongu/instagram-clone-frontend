// apps/web-spa/src/components/PostBody.tsx
import { useSearchParams } from 'react-router';
import { LikeButton } from './LikeButton';
import { Button } from './Button';
import { PostModal } from './PostModal';
import { useToggle } from '../hooks/useToggle';

// 이 글자 수를 넘는 캡션은 접어서 보여준다
const CAPTION_LIMIT = 10;

interface PostBodyProps {
  id: number;
  username: string;
  profileImageUrl: string;
  imageUrl: string;
  content: string;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  onToggle: () => void;
}

// 사진 아래 본문 구역 — 좋아요·캡션·댓글 수가 함께 산다.
export function PostBody({
  id,
  username,
  profileImageUrl,
  imageUrl,
  content,
  liked,
  likeCount,
  commentCount,
  onToggle,
}: PostBodyProps) {
  const [captionOpen, toggleCaption] = useToggle();

  // 위에서 받아 넘기지 않고 여기서 직접 읽는다.
  // 이 값은 원래 주소에 적혀 있었고, 주소는 누구나 물어볼 수 있다.
  const [searchParams, setSearchParams] = useSearchParams();
  const openPostId = searchParams.get('post');
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
        open={openPostId === String(id)}
        onOpenChange={(open) => setSearchParams(open ? { post: String(id) } : {})}
      />
    </>
  );
}
