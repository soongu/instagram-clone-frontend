// apps/web-spa/scratch/c6-story-answer.tsx
//
// C-6 과제 예시답안 (내부 검증용)
import { useQuery } from '@tanstack/react-query';
import { useLoaderData, useNavigate, useParams } from 'react-router';
import { ApiError } from '../src/api/client';
import type { postLoader } from '../src/routes/postLoader';
import { postQuery, useLikeMutation } from '../src/queries/posts';
import { LikeButton } from '../src/components/LikeButton';
import { Toast } from '../src/components/Toast';
import { Section } from '../src/components/Section';

// ── 과제 1: 좋아요를 상세 화면에서도
export function AnswerPostDetail() {
  const { post: loaded } = useLoaderData<typeof postLoader>();
  const { postId } = useParams();
  const navigate = useNavigate();
  const likeMutation = useLikeMutation();

  const { data: post } = useQuery({
    ...postQuery(Number(postId)),
    initialData: loaded,
  });

  return (
    <Section title="게시물">
      <button onClick={() => navigate(-1)}>뒤로</button>
      <p>{post.content}</p>
      <LikeButton
        liked={post.liked}
        likeCount={post.likeCount}
        onToggle={() => likeMutation.mutate(post.id)}
      />
    </Section>
  );
}

// ── 과제 2: 실패를 눈에 보이게
//
// 피드에서 좋아요가 실패하면 알림으로 알린다.
// FeedSection 이 이미 알림을 그리고 있으므로, 무엇을 보고 띄울지만 정하면 된다.
export function likeErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : '좋아요를 저장하지 못했어요';
}

interface LikeFailureToastProps {
  isError: boolean;
  error: unknown;
}

export function LikeFailureToast({ isError, error }: LikeFailureToastProps) {
  if (!isError) {
    return null;
  }

  return <Toast message={likeErrorMessage(error)} />;
}
