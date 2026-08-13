// apps/web-spa/src/components/LikeButton.tsx
import { Heart } from 'lucide-react';
import { IconButton } from './IconButton';

interface LikeButtonProps {
  liked: boolean;
  likeCount: number;
  onToggle: () => void;
}

// 사진 아래 첫 줄 — 아이콘이 한 줄로 서고 그 아래에 개수가 온다.
// 인스타그램에는 아이콘이 넷이지만 우리 앱에 있는 동작은 좋아요 하나뿐이라 하나만 둔다.
export function LikeButton({ liked, likeCount, onToggle }: LikeButtonProps) {
  // 아이콘 버튼은 누를 자리를 넓히려고 안쪽 여백을 갖는다.
  // 그만큼 바깥 여백에서 빼야 하트가 아래 캡션과 같은 자리에서 시작한다.
  return (
    <div className="px-1 pt-2">
      <IconButton
        className="cursor-pointer p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        aria-label="좋아요"
        aria-pressed={liked}
        onClick={onToggle}
      >
        {/* 이름이 안 바뀌니 눌렸다는 것은 aria-pressed 가 알린다.
            눈으로 보는 사람에게는 속을 채우고 색을 바꿔서 알린다. */}
        <Heart className={`size-6 ${liked ? 'fill-current text-danger' : ''}`} />
      </IconButton>
      {likeCount > 0 && <p className="px-2 pt-1 pb-1 text-sm font-semibold">좋아요 {likeCount}개</p>}
    </div>
  );
}
