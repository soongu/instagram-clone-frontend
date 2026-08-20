// apps/web-next/lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

/**
 * 댓글에 허용할 서식. 여기 없는 것은 전부 지운다.
 *
 * 목록을 넓게 잡을수록 나중에 후회한다. 지금 필요한 것만 적었다.
 * 댓글에 이미지가 빠진 것은 우리가 필요 없다고 정한 것이지 img 가 위험해서가 아니다.
 */
const ALLOWED_TAGS = ['b', 'i', 'strong', 'em', 'br', 'a'];
const ALLOWED_ATTR = ['href'];

/**
 * 저장된 댓글을 화면에 그리기 직전에 통과시킨다.
 *
 * 브라우저에도 같은 일을 하는 기능이 생겼지만(`Element.setHTML`) 그건 브라우저 API 다.
 * 댓글은 서버 컴포넌트가 그리고 서버에는 그 함수가 없다 — 그래서 여기서 한다.
 *
 * 쓸 때가 아니라 그릴 때 하는 이유는, 우리가 이 함수를 만들기 전에 저장된 것도 있고
 * 다른 경로로 들어온 것도 있기 때문이다. 화면으로 나가는 길목이 마지막 관문이다.
 */
export function sanitizeComment(raw: string): string {
  return DOMPurify.sanitize(raw, { ALLOWED_TAGS, ALLOWED_ATTR });
}
