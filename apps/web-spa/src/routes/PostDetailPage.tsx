// apps/web-spa/src/routes/PostDetailPage.tsx
import { useLoaderData, useNavigate } from 'react-router';
import type { postLoader } from './postLoader';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { PostHeader } from '../components/PostHeader';
import { Section } from '../components/Section';

export function PostDetailPage() {
  // 꺾쇠 안을 비우면 any 가 돌아온다. 타입 검사가 통과해버리니 아무도 안 알려준다.
  // loader 가 무엇을 돌려주는지 알려주면 여기서부터 타입이 산다.
  const { post } = useLoaderData<typeof postLoader>();
  const navigate = useNavigate();

  // 갈래가 전부 사라졌다. 기다리는 중도 없고, 못 찾은 경우도 없다.
  // 이 화면이 그려지고 있다는 건 게시물이 이미 손에 있다는 뜻이다.
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
