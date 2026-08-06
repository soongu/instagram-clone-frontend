// apps/web-spa/src/components/LikeButton.tsx
import { Button } from './Button';

interface LikeButtonProps {
  liked: boolean;
  likeCount: number;
  onToggle: () => void;
}

export function LikeButton({ liked, likeCount, onToggle }: LikeButtonProps) {
  return (
    <div className="px-3 pt-2">
      <Button
        className={`cursor-pointer rounded-md border bg-surface px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          liked ? 'border-danger font-semibold text-danger' : 'border-line'
        }`}
        onClick={onToggle}
      >
        {liked ? '♥ 좋아요 취소' : '♡ 좋아요'}
      </Button>
      {likeCount > 0 && <p className="px-3 pt-3 pb-1 text-sm font-semibold">좋아요 {likeCount}개</p>}
    </div>
  );
}
