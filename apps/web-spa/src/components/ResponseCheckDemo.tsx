// apps/web-spa/src/components/ResponseCheckDemo.tsx
import { PostSchema } from '../lib/schemas';
import { isPost } from '../types/guards';

// 서버가 이렇게 준다고 믿었던 모양
const healthy: unknown = {
  id: 1,
  username: 'jaehoon',
  profileImageUrl: 'https://picsum.photos/seed/jaehoon/64/64',
  imageUrl: 'https://picsum.photos/seed/post1/640/640',
  mediaKind: 'image',
  content: '오늘 한강 노을이 미쳤다',
  hashtagNames: ['한강', '노을'],
  likeCount: 1240,
  commentCount: 32,
  liked: false,
  createdAt: '2026-07-20T18:30:00',
};

// 필드 이름은 그대로인데 값의 모양이 어긋난 응답
const broken: unknown = {
  id: 1,
  username: 'jaehoon',
  imageUrl: 'https://picsum.photos/seed/post1/640/640',
  likeCount: 1240,
  profileImageUrl: null,
  mediaKind: 'gif',
  content: 42,
  hashtagNames: '한강',
  commentCount: '32',
  liked: 'false',
  createdAt: 0,
};

function complaints(payload: unknown): string[] {
  const result = PostSchema.safeParse(payload);

  if (result.success) {
    return [];
  }

  return result.error.issues.map((issue) => `${issue.path.join('.')} — ${issue.message}`);
}

interface PanelProps {
  title: string;
  payload: unknown;
}

function Panel({ title, payload }: PanelProps) {
  const found = complaints(payload);

  return (
    <section className="response-panel" aria-label={title}>
      <h4 className="response-title">{title}</h4>
      <p className="response-verdict">{isPost(payload) ? 'isPost: 통과' : 'isPost: 막힘'}</p>
      <p className="response-verdict">
        {found.length === 0 ? '스키마: 통과' : '스키마: 막힘'}
      </p>
      <ul className="response-issues">
        {found.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}

export function ResponseCheckDemo() {
  return (
    <div className="response-demo">
      <Panel title="성한 응답" payload={healthy} />
      <Panel title="망가진 응답" payload={broken} />
    </div>
  );
}
