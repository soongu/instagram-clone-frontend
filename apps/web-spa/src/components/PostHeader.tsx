// apps/web-spa/src/components/PostHeader.tsx
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { IconButton } from './IconButton';

interface PostHeaderProps {
  username: string;
  profileImageUrl: string;
}

// 머리 구역에는 프로필과 더보기 버튼이 나란히 선다.
// 묶을 것이 둘 이상이라 파일을 따로 둘 이유가 생긴다.
export function PostHeader({ username, profileImageUrl }: PostHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Avatar>
          <AvatarImage src={profileImageUrl} alt={`${username} 프로필 사진`} />
          {/* 사진이 아직 안 왔거나 실패했을 때 이 자리에 남는 것 */}
          <AvatarFallback>{username.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-semibold">{username}</span>
      </div>
      <IconButton
        className="cursor-pointer p-3 text-lg leading-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        aria-label="게시물 메뉴"
      >
        ⋯
      </IconButton>
    </div>
  );
}
