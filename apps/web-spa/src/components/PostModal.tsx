// apps/web-spa/src/components/PostModal.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface PostModalProps {
  username: string;
  profileImageUrl: string;
  imageUrl: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

// 게시물을 크게 띄우는 대화 상자.
// 여는 자리는 "댓글 N개 모두 보기" — 사진에는 이미 두 번 누르기가 붙어 있다.
export function PostModal({
  username,
  profileImageUrl,
  imageUrl,
  content,
  likeCount,
  commentCount,
}: PostModalProps) {
  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer px-3 pt-1 pb-3 text-left text-sm text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
        댓글 {commentCount}개 모두 보기
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] gap-3 sm:max-w-lg">
        <DialogTitle className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarImage src={profileImageUrl} alt={`${username} 프로필 사진`} />
            <AvatarFallback>{username.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          {username}
        </DialogTitle>
        <img className="w-full rounded-lg" src={imageUrl} alt={`${username} 의 게시물`} />
        <DialogDescription>{content}</DialogDescription>
        <p className="text-sm text-faint">
          좋아요 {likeCount}개 · 댓글 {commentCount}개
        </p>
      </DialogContent>
    </Dialog>
  );
}
