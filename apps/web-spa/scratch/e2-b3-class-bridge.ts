// E-2 에서 컴포넌트가 손으로 지은 클래스 이름 대신 토큰 유틸리티를 쓰게 됐다.
//
// b3-lecture-snapshots.tsx 는 B-3 시점 코드를 글자 그대로 보존하는 파일이라
// 그 안의 클래스 이름은 B-3 교안 코드 블록과 같아야 한다(바꾸면 교안과 어긋난다).
// 그런데 그 스냅샷들은 살아 있는 컴포넌트(Avatar·PostImage·LikeButton·PostHeader·
// Section·Feed)를 임포트하므로, E-2 가 그것들을 유틸리티로 옮긴 뒤부터
// "스냅샷 안쪽은 옛 이름 / 임포트한 컴포넌트는 새 유틸리티" 로 갈렸다.
//
// 그래서 견주기 전에 E-2 유틸리티를 B-3 시점 이름으로 되돌린다.
// 비교 대상 자체(구조·글자·순서)는 건드리지 않는다 — 클래스 이름만 옛 이름으로 돌린다.
//
// ⚠️ 이 되돌리기가 조용히 안 걸리면 비교는 아무것도 증명하지 못한다.
//    그래서 b3BridgeHits() 로 "무엇이 실제로 되돌려졌는지" 를 함께 확인한다.

// [E-2 유틸리티 문자열, B-3 시점 이름]
// liked 쪽을 먼저 둔다 — 두 좋아요 버튼 문자열은 뒷부분만 다르다.
const BRIDGE: Array<[string, string]> = [
  ['class="mx-auto max-w-[470px] p-4"', 'class="feed"'],
  ['class="mb-4 flex items-baseline justify-between"', 'class="feed-header"'],
  ['class="mb-4 text-2xl font-bold"', 'class="feed-title"'],
  ['class="mb-6 overflow-hidden rounded-lg border border-line bg-surface"', 'class="post-card"'],
  ['class="flex items-center justify-between"', 'class="post-header"'],
  ['class="cursor-pointer p-3 text-lg leading-none"', 'class="post-more"'],
  ['class="w-full cursor-pointer"', 'class="post-image"'],
  ['class="px-3 py-1 text-sm"', 'class="post-content"'],
  ['class="cursor-pointer pl-1 text-sm text-muted"', 'class="caption-toggle"'],
  ['class="px-3 pt-1 pb-3 text-sm text-muted"', 'class="post-comments"'],
  ['class="px-3 pt-2"', 'class="like-area"'],
  [
    'class="cursor-pointer rounded-md border bg-surface px-3 py-1.5 text-sm border-danger font-semibold text-danger"',
    'class="like-button liked"',
  ],
  [
    'class="cursor-pointer rounded-md border bg-surface px-3 py-1.5 text-sm border-line"',
    'class="like-button"',
  ],
  ['class="px-3 pt-3 pb-1 text-sm font-semibold"', 'class="post-likes"'],
  ['class="mb-3 text-sm font-semibold text-muted"', 'class="section-title"'],
  ['class="cursor-pointer px-3 py-1 text-note text-muted"', 'class="hide-button"'],
  // ── 댓글·폼·토스트 (Step 6) ────────────────────────────────
  ['class="flex gap-2 border-t border-line-soft p-3"', 'class="comment-form"'],
  ['class="flex-1 text-sm"', 'class="comment-input"'],
  // :disabled·:hover 규칙이 이 이름을 붙잡고 있어 손 이름이 그대로 남아 있다
  [
    'class="comment-submit cursor-pointer text-sm font-semibold text-brand"',
    'class="comment-submit"',
  ],
  ['class="px-3 pb-3 text-sm"', 'class="comment-list"'],
  [
    'class="comment-remove cursor-pointer px-1 text-sm leading-none text-muted"',
    'class="comment-remove"',
  ],
  [
    'class="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-[20px] bg-black/82 px-4.5 py-2.5 text-sm text-white"',
    'class="toast"',
  ],
  [
    'class="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4"',
    'class="signup-form"',
  ],
  ['class="flex flex-col gap-1"', 'class="signup-field"'],
  ['class="text-xs text-subtle"', 'class="signup-label"'],
  ['class="rounded-md border border-line p-2 text-sm"', 'class="signup-input"'],
  ['class="text-xs text-danger"', 'class="signup-error"'],
  [
    'class="cursor-pointer rounded-lg bg-brand p-2 text-sm font-semibold text-white"',
    'class="signup-submit"',
  ],
  // feed-liked-count 는 다른 곳과 겹치지 않는 조합이라 마지막에 둔다
  ['class="text-sm text-muted"', 'class="feed-liked-count"'],
  // E-2 에서 통째로 사라진 두 이름은 되살려 넣는다
  ['<ul aria-label="피드 목록"', '<ul class="feed-list" aria-label="피드 목록"'],
  ['<section aria-label=', '<section class="section" aria-label='],
];

/** E-2 유틸리티를 B-3 시점 클래스 이름으로 되돌린 HTML */
export function toB3Classes(html: string): string {
  let out = html;
  for (const [utility, legacy] of BRIDGE) {
    out = out.split(utility).join(legacy);
  }
  return out;
}

/** 이 HTML 에서 실제로 되돌려진 B-3 이름들 — 되돌리기가 걸렸는지 확인하는 용도 */
export function b3BridgeHits(html: string): string[] {
  return BRIDGE.filter(([utility]) => html.includes(utility)).map(([, legacy]) =>
    // 'class="post-card"' -> 'post-card' / '<ul class="feed-list" ...' -> 'feed-list'
    (legacy.match(/class="([^"]+)"/) as RegExpMatchArray)[1],
  );
}
