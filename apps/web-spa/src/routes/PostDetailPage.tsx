// apps/web-spa/src/routes/PostDetailPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { fetchPost } from '../data/feed';
import type { Post } from '../types/instagram';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { PostHeader } from '../components/PostHeader';
import { Section } from '../components/Section';

// 무엇을 담았는지가 아니라 "어느 주소의 것을 담았는지" 를 함께 들고 있어야
// 지금 보는 주소의 답이 왔는지 알 수 있다.
interface Loaded {
  postId: string | undefined;
  post: Post | null;
}

export function PostDetailPage() {
  // 주소 표에는 :postId 라고 적어뒀지만 타입은 그 표를 읽지 못한다.
  // 그래서 여기서 받는 값은 언제나 string | undefined 다.
  const { postId } = useParams();
  const navigate = useNavigate();

  // 데이터가 늦게 오니 담아둘 자리가 생겼다.
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    // 늦게 온 응답이 이미 떠난 화면을 덮어쓰지 않게 표시를 남긴다
    let cancelled = false;

    fetchPost(Number(postId)).then((found) => {
      if (!cancelled) {
        setLoaded({ postId, post: found ?? null });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  // 기다리는 중인지는 따로 기억하지 않는다 — 담긴 것이 지금 주소의 답인지만 보면 된다.
  // 따로 기억하면 effect 본문에서 setState 를 부르게 되고, 린터가 그것을 막는다.
  const loading = loaded === null || loaded.postId !== postId;

  return (
    <Section title="게시물">
      {/* 주소를 적어 보내는 게 아니라 "한 칸 뒤로" 다.
          어디서 왔는지는 우리가 모르고, 알 필요도 없다. */}
      <Button variant="ghost" size="sm" className="mb-3" onClick={() => navigate(-1)}>
        뒤로
      </Button>

      {/* 세 갈래가 전부 이 컴포넌트 몫이 됐다. 화면이 먼저 뜨기 때문에 생긴 일이다. */}
      {loading && <p className="text-sm text-faint">불러오는 중...</p>}

      {!loading && loaded.post === null && (
        <p className="text-sm text-faint">게시물을 찾을 수 없습니다.</p>
      )}

      {!loading && loaded.post !== null && (
        <Card className="@container mx-auto max-w-[470px]">
          <CardHeader>
            <PostHeader
              username={loaded.post.username}
              profileImageUrl={loaded.post.profileImageUrl}
            />
          </CardHeader>
          <img
            className="w-full"
            src={loaded.post.imageUrl}
            alt={`${loaded.post.username} 의 게시물`}
          />
          <CardContent>
            <p className="px-3 pt-3 pb-1 text-sm font-semibold">
              좋아요 {loaded.post.likeCount}개
            </p>
            <p className="px-3 py-1 text-sm">{loaded.post.content}</p>
            <p className="px-3 pb-3 text-sm text-faint">댓글 {loaded.post.commentCount}개</p>
          </CardContent>
        </Card>
      )}
    </Section>
  );
}
