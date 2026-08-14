// C-5 과제 예시답안 — 실행해서 확인하는 판 (내부 검증용)
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { ApiError } from '../src/api/client';
import { fetchPostById } from '../src/api/posts';
import { useFeedQuery } from '../src/queries/posts';
import { FeedSection } from '../src/components/FeedSection';
import { Button } from '../src/components/ui/button';

// ── 과제 1: 게시물 상세도 서버에서

export function postKey(id: number) {
  return ['posts', 'detail', { id }] as const;
}

export function usePostQuery(id: number) {
  return useQuery({
    queryKey: postKey(id),
    queryFn: () => fetchPostById(id),
  });
}

export function AnswerPostDetail() {
  const { postId } = useParams();
  const id = Number(postId);

  const { data: post, isPending, error } = usePostQuery(id);

  if (error !== null) {
    return (
      <p>{error instanceof ApiError ? error.message : '게시물을 불러오지 못했어요'}</p>
    );
  }

  if (isPending) {
    return <p>게시물을 불러오는 중이에요…</p>;
  }

  return (
    <article aria-label="게시물">
      <h2>{post.username}</h2>
      <p>{post.content}</p>
      <p>좋아요 {post.likeCount}개</p>
    </article>
  );
}

// ── 과제 2: 다시 불러오기 버튼

export function AnswerFeedWithRefresh() {
  // isPending 은 '아직 데이터가 없다', isFetching 은 '지금 요청이 나가 있다'.
  // 목록을 계속 보여주면서 버튼만 바꾸려면 isFetching 을 본다.
  const { data: posts, isPending, isFetching, error, refetch } = useFeedQuery();

  if (error !== null) {
    return <p>{error instanceof ApiError ? error.message : '피드를 불러오지 못했어요'}</p>;
  }

  if (isPending) {
    return <p>피드를 불러오는 중이에요…</p>;
  }

  return (
    <>
      <Button size="sm" disabled={isFetching} onClick={() => void refetch()}>
        {isFetching ? '불러오는 중…' : '새로고침'}
      </Button>
      {/* 다시 물어보는 동안에도 목록은 그대로 남는다 */}
      <FeedSection posts={posts} />
    </>
  );
}
