// apps/web-spa/src/components/Feed.tsx
import type { Post } from '../types/instagram';
import { List } from './List';
import { PostCard } from './PostCard';

interface FeedProps {
  posts: Post[];
  onToggleLike: (id: number) => void;
  // 지금 열려 있는 게시물 번호. 아무것도 안 주면 카드들이 알아서 연다.
  openPostId?: number | null;
  onOpenPost?: (id: number | null) => void;
}

// 댓글 목록과 하는 일이 같아서 같은 컴포넌트를 쓴다.
// 담기는 것이 Post 라는 것만 다르다.
export function Feed({ posts, onToggleLike, openPostId, onOpenPost }: FeedProps) {
  return (
    <List
      items={posts}
      className="@2col:grid @2col:grid-cols-2 @2col:gap-6"
      aria-label="피드 목록"
      renderItem={(post) => (
        <PostCard
          {...post}
          onToggleLike={onToggleLike}
          // 위에서 여닫기를 맡아주면 그때부터 카드는 시키는 대로만 한다.
          modalOpen={onOpenPost === undefined ? undefined : openPostId === post.id}
          onModalOpenChange={
            onOpenPost === undefined
              ? undefined
              : (open) => onOpenPost(open ? post.id : null)
          }
        />
      )}
    />
  );
}
