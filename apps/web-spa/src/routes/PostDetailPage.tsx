// apps/web-spa/src/routes/PostDetailPage.tsx
import { useNavigate, useParams } from 'react-router';
import { feedPosts } from '../data/feed';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { PostHeader } from '../components/PostHeader';
import { Section } from '../components/Section';

export function PostDetailPage() {
  // 주소 표에는 :postId 라고 적어뒀지만 타입은 그 표를 읽지 못한다.
  // 그래서 여기서 받는 값은 언제나 string | undefined 다.
  const { postId } = useParams();
  const navigate = useNavigate();

  // id 는 number, postId 는 string — 바꾸지 않으면 영원히 안 맞는다.
  const post = feedPosts.find((item) => item.id === Number(postId));

  if (!post) {
    return (
      <Section title="게시물">
        <p className="text-sm text-faint">게시물을 찾을 수 없습니다.</p>
      </Section>
    );
  }

  return (
    <Section title="게시물">
      {/* 주소를 적어 보내는 게 아니라 "한 칸 뒤로" 다.
          어디서 왔는지는 우리가 모르고, 알 필요도 없다. */}
      <Button variant="ghost" size="sm" className="mb-3" onClick={() => navigate(-1)}>
        뒤로
      </Button>
      <Card className="@container mx-auto max-w-[470px]">
        <CardHeader>
          <PostHeader username={post.username} profileImageUrl={post.profileImageUrl} />
        </CardHeader>
        <img className="w-full" src={post.imageUrl} alt={`${post.username} 의 게시물`} />
        <CardContent>
          <p className="px-3 pt-3 pb-1 text-sm font-semibold">좋아요 {post.likeCount}개</p>
          <p className="px-3 py-1 text-sm">{post.content}</p>
          <p className="px-3 pb-3 text-sm text-faint">댓글 {post.commentCount}개</p>
        </CardContent>
      </Card>
    </Section>
  );
}
