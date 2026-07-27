// B-2 Step 2~3 시점의 LikeButton 스냅샷 (내부 검증용)
//
// 교안 Step 2~3 은 src/components/LikeButton.tsx 를 이 모습으로 만든다.
// Step 5 에서 상태를 App 으로 끌어올리며 제어 컴포넌트로 바뀌기 때문에
// HEAD 의 LikeButton.tsx 와는 다르다. Step 2~3 교안 코드 블록이 실제로
// 동작한다는 증거를 남기려고 이 자리에 보존한다.
import { useState } from 'react';

interface LikeButtonProps {
  initialLiked: boolean;
  initialLikeCount: number;
}

export function LikeButton({ initialLiked, initialLikeCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  function handleClick() {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  }

  return (
    <div className="like-area">
      <button
        className={liked ? 'like-button liked' : 'like-button'}
        onClick={handleClick}
      >
        {liked ? '♥ 좋아요 취소' : '♡ 좋아요'}
      </button>
      {likeCount > 0 && <p className="post-likes">좋아요 {likeCount}개</p>}
    </div>
  );
}
