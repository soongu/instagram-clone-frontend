// B-2 교안·과제에 인용할 컴파일 에러 채증 (내부 검증용)
//
// 재현:
//   npx tsc --noEmit --ignoreConfig --strict --target es2025 --module esnext \
//     --moduleResolution bundler --jsx react-jsx --lib es2025,dom --skipLibCheck \
//     scratch/b2-expected-errors.tsx
import { useState } from 'react';

// 1. onClick 에 함수를 부른 결과를 넘긴다 (참조가 아니라 호출)
export function CallInsteadOfPass() {
  function handleClick() {
    console.log('눌렸다');
  }

  return <button onClick={handleClick()}>좋아요</button>;
}

// 2. 상태 변수를 직접 바꾼다
export function AssignToState() {
  const [liked, setLiked] = useState(false);

  function handleClick() {
    liked = true;
    setLiked(liked);
  }

  return <button onClick={handleClick}>{liked ? '♥' : '♡'}</button>;
}

// 3. onChange 에서 이벤트 객체를 통째로 넘긴다
export function PassEventItself() {
  const [content, setContent] = useState('');

  return (
    <input
      value={content}
      onChange={(event) => setContent(event)}
    />
  );
}

// 4. 초기값 타입과 다른 값을 상태에 넣는다
export function WrongStateType() {
  const [likeCount, setLikeCount] = useState(0);

  return (
    <button onClick={() => setLikeCount('1241')}>좋아요 {likeCount}개</button>
  );
}

// 5. 빈 배열로 시작한 상태에 값을 밀어 넣는다 (never[] 로 추론된다)
export function NeverArrayState() {
  const [comments, setComments] = useState([]);

  return (
    <button onClick={() => setComments(['좋네요'])}>
      댓글 {comments.length}개
    </button>
  );
}
