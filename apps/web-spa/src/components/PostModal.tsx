// apps/web-spa/src/components/PostModal.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { PostHeader } from './PostHeader';

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
      <DialogContent className="@container max-w-[calc(100%-2rem)] gap-3 sm:max-w-4xl">
        {/* 낭독기는 이 이름으로 상자를 부른다.
            화면에는 아래 머리 구역이 대신 보이므로 이름만 남기고 감춘다. */}
        <DialogTitle className="sr-only">{username} 의 게시물</DialogTitle>
        <div className="grid gap-3 @3xl:grid-cols-2 @3xl:items-start @3xl:gap-5">
          <img className="w-full rounded-lg" src={imageUrl} alt={`${username} 의 게시물`} />
          <div className="flex flex-col gap-2">
            <PostHeader username={username} profileImageUrl={profileImageUrl} />
            <DialogDescription>{content}</DialogDescription>
            <p className="text-sm text-faint">
              좋아요 {likeCount}개 · 댓글 {commentCount}개
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
