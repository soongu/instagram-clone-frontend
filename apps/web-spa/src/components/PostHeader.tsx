// apps/web-spa/src/components/PostHeader.tsx
import { Avatar } from './Avatar';
import { Button } from './Button';

interface PostHeaderProps {
  username: string;
  profileImageUrl: string;
}

// 머리 구역에는 프로필과 더보기 버튼이 나란히 선다.
// 묶을 것이 둘 이상이라 파일을 따로 둘 이유가 생긴다.
export function PostHeader({ username, profileImageUrl }: PostHeaderProps) {
  return (
    <div className="post-header">
      <Avatar username={username} profileImageUrl={profileImageUrl} />
      <Button className="post-more" aria-label="더보기">
        ⋯
      </Button>
    </div>
  );
}
