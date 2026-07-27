// apps/web-spa/src/components/LikeButton.tsx

interface LikeButtonProps {
  liked: boolean;
  likeCount: number;
  onToggle: () => void;
}

export function LikeButton({ liked, likeCount, onToggle }: LikeButtonProps) {
  return (
    <div className="like-area">
      <button
        className={liked ? 'like-button liked' : 'like-button'}
        onClick={onToggle}
      >
        {liked ? '♥ 좋아요 취소' : '♡ 좋아요'}
      </button>
      {likeCount > 0 && <p className="post-likes">좋아요 {likeCount}개</p>}
    </div>
  );
}
