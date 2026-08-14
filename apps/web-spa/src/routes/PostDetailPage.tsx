// apps/web-spa/src/routes/PostDetailPage.tsx
import { useLoaderData, useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import type { postLoader } from './postLoader';
import { postQuery } from '../queries/posts';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { PostComments } from '../components/PostComments';
import { PostHeader } from '../components/PostHeader';
import { Section } from '../components/Section';

export function PostDetailPage() {
  // 꺾쇠 안을 비우면 any 가 돌아온다. 타입 검사가 통과해버리니 아무도 안 알려준다.
  // loader 가 무엇을 돌려주는지 알려주면 여기서부터 타입이 산다.
  const { post: loaded } = useLoaderData<typeof postLoader>();
  const { postId } = useParams();
  const navigate = useNavigate();

  // loader 가 받아온 것을 첫 값으로 건네준다.
  // 그래서 이 화면에는 여전히 기다리는 갈래가 없다 — 처음부터 손에 있다.
  // 그 뒤로는 창고가 맡는다. 좋아요를 눌러 창고가 갱신되면 여기도 따라 바뀐다.
  const { data: post } = useQuery({
    ...postQuery(Number(postId)),
    initialData: loaded,
  });

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
          <PostComments postId={post.id} />
        </CardContent>
      </Card>
    </Section>
  );
}
