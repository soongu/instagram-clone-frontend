// A-4 교안이 Step 을 넘어가며 진화시키는 중간 단계 보존 (내부 검증용)
//
// HEAD 의 src/components/*.tsx 는 마지막 Step 의 모습만 남으므로,
// 교안이 Step 1~6 에서 보여주는 중간 형태를 여기에 접미사를 붙여 남긴다.
// 이름과 임포트 경로를 빼면 교안 코드 블록과 글자 단위로 같다.
import { useState } from 'react';

// ─── Step 1 이전 (B-2 가 남긴 모습) ───────────────────────────
// 핸들러가 전부 JSX 안 인라인 화살표라 event 타입을 한 번도 안 적었다.
interface CommentFormProps {
  onSubmit: (content: string) => void;
}

export function CommentFormBefore({ onSubmit }: CommentFormProps) {
  const [content, setContent] = useState('');
  const isEmpty = content.trim() === '';

  return (
    <form
      className="comment-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(content.trim());
        setContent('');
      }}
    >
      <input
        className="comment-input"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="댓글 달기..."
        aria-label="댓글 입력"
      />
      <button className="comment-submit" type="submit" disabled={isEmpty}>
        게시
      </button>
    </form>
  );
}

// ─── Step 1: onChange 핸들러만 이름 붙여 밖으로 뺀다 ──────────
// 밖으로 빼는 순간 event 타입을 직접 적어야 한다.
export function CommentFormStep1({ onSubmit }: CommentFormProps) {
  const [content, setContent] = useState('');
  const isEmpty = content.trim() === '';

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setContent(event.target.value);
  }

  return (
    <form
      className="comment-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(content.trim());
        setContent('');
      }}
    >
      <input
        className="comment-input"
        value={content}
        onChange={handleChange}
        placeholder="댓글 달기..."
        aria-label="댓글 입력"
      />
      <button className="comment-submit" type="submit" disabled={isEmpty}>
        게시
      </button>
    </form>
  );
}

// ─── Step 2: 제출 핸들러도 이름을 붙인다 (FormEvent) ──────────
export function CommentFormStep2({ onSubmit }: CommentFormProps) {
  const [content, setContent] = useState('');
  const isEmpty = content.trim() === '';

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setContent(event.target.value);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isEmpty) {
      return;
    }
    onSubmit(content.trim());
    setContent('');
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <input
        className="comment-input"
        value={content}
        onChange={handleChange}
        placeholder="댓글 달기..."
        aria-label="댓글 입력"
      />
      <button className="comment-submit" type="submit" disabled={isEmpty}>
        게시
      </button>
    </form>
  );
}

// ─── Step 3: 이벤트가 필요 없는 핸들러는 매개변수를 안 받아도 된다 ───
// onClick 이 요구하는 타입은 MouseEventHandler 인데, 매개변수를 덜 받는
// 함수도 그 자리에 들어간다. B-2 의 onToggle: () => void 가 통했던 이유.
interface LikeButtonProps {
  liked: boolean;
  likeCount: number;
  onToggle: () => void;
}

export function LikeButtonStep3({ liked, likeCount, onToggle }: LikeButtonProps) {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = () => {
    onToggle();
  };

  return (
    <div className="like-area">
      <button
        className={liked ? 'like-button liked' : 'like-button'}
        onClick={handleClick}
      >
        {liked ? '♥ 좋아요 취소' : '♡ 좋아요'}
      </button>
      {likeCount > 0 && <p className="post-likes">좋아요 {likeCount}개</p>}
    </div>
  );
}

// ─── Step 3: 핸들러 별칭으로 props 를 적은 입력창 ─────────────
// (event: React.ChangeEvent<HTMLInputElement>) => void 와 같은 뜻이다.
interface CommentInputAliasProps {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

export function CommentInputWithAlias({ value, onChange }: CommentInputAliasProps) {
  return (
    <input
      className="comment-input"
      value={value}
      onChange={onChange}
      placeholder="댓글 달기..."
      aria-label="댓글 입력"
    />
  );
}

// ─── Step 6: children 을 받지 않는 컴포넌트 ───────────────────
// props 에 children 을 안 적으면 자식을 넘길 수 없다.
interface BadgeProps {
  label: string;
}

export function Badge({ label }: BadgeProps) {
  return <span className="badge">{label}</span>;
}
