// apps/web-spa/src/components/PostHeader.tsx
import { Ellipsis } from 'lucide-react';
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
      {/* 담긴 통이 넓어지면 프로필이 커지고 사이가 벌어진다.
          이 글자는 카드 안에서도 모달 안에서도 똑같다 — 갈리는 것은 통의 폭뿐이다. */}
      <div className="flex items-center gap-2.5 @lg:gap-4">
        <Avatar className="@lg:size-11">
          <AvatarImage src={profileImageUrl} alt={`${username} 프로필 사진`} />
          {/* 사진이 아직 안 왔거나 실패했을 때 이 자리에 남는 것 */}
          <AvatarFallback>{username.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-semibold @lg:text-base">{username}</span>
      </div>
      <IconButton
        className="cursor-pointer p-3 text-lg leading-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        aria-label="게시물 메뉴"
      >
        {/* 그림은 자기 크기를 24px 로 갖고 온다. 글자 크기로는 안 바뀌므로 따로 준다.
            넓은 통에서 커지는 것은 옆의 프로필과 같은 조건을 쓴다. */}
        <Ellipsis className="size-5 @lg:size-6" />
      </IconButton>
    </div>
  );
}
