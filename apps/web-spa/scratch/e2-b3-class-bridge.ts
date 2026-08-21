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

// E-3 Step 3 이 조작 가능한 요소 여덟 곳에 똑같이 붙인 포커스 링.
// 한 글자라도 어긋나면 되돌리기가 조용히 안 걸리므로 상수로 둔다.
const RING =
  ' focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

// E-6 에서 들여온 Card 가 카드 몸통에 얹는 클래스 한 뭉치.
// 한 글자라도 어긋나면 되돌리기가 조용히 안 걸리므로 상수로 둔다.
const CARD_UTILITIES =
  'group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[&gt;img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl @container mx-auto mb-6 max-w-[470px] @2col:mb-0';

// [E-2·E-3 유틸리티 문자열, B-3 시점 이름]
// liked 쪽을 먼저 둔다 — 두 좋아요 버튼 문자열은 뒷부분만 다르다.
const BRIDGE: Array<[string, string]> = [
  ['class="@container mx-auto max-w-[996px] py-4 sm:px-4"', 'class="feed"'],
  ['class="mb-4 flex items-baseline justify-between"', 'class="feed-header"'],
  ['class="mb-4 text-2xl font-bold"', 'class="feed-title"'],
  // E-6 에서 카드 몸통이 들여온 Card 로 바뀌었다. 되돌릴 대상 문자열도 함께 옮긴다.
  [`class="${CARD_UTILITIES}"`, 'class="post-card"'],
  ['class="flex items-center justify-between"', 'class="post-header"'],
  [`class="cursor-pointer p-3 text-lg leading-none${RING}"`, 'class="post-more"'],
  ['class="w-full cursor-pointer"', 'class="post-image"'],
  ['class="px-3 py-1 text-sm"', 'class="post-content"'],
  [`class="cursor-pointer pl-1 text-sm text-faint${RING}"`, 'class="caption-toggle"'],
  ['class="px-3 pt-1 pb-3 text-sm text-faint"', 'class="post-comments"'],
  ['class="px-1 pt-2"', 'class="like-area"'],
  // E-7 에서 좋아요가 글자 버튼에서 아이콘 버튼이 됐다. 눌린 것과 안 눌린 것의
  // 클래스가 같아졌으므로(갈리는 곳이 아이콘으로 옮겨갔다) 되돌릴 짝이 없다.
  // 그 자리는 withSameLikeArea 로 양쪽을 같은 표시로 맞춘다.
  ['class="px-2 pt-1 pb-1 text-sm font-semibold"', 'class="post-likes"'],
  ['class="mb-3 text-sm font-semibold text-faint"', 'class="section-title"'],
  ['class="cursor-pointer px-3 py-1 text-note text-faint"', 'class="hide-button"'],
  // ── 댓글·폼·토스트 (Step 6) ────────────────────────────────
  ['class="flex gap-2 border-t border-line-soft p-3"', 'class="comment-form"'],
  [`class="flex-1 py-1 text-sm${RING}"`, 'class="comment-input"'],
  // E-3 이 :disabled·:hover 규칙을 변형으로 옮기면서 손 이름 두 개가 마저 떨어졌다
  [
    `class="cursor-pointer py-1 text-sm font-semibold text-brand disabled:cursor-default disabled:text-brand/30${RING}"`,
    'class="comment-submit"',
  ],
  ['class="px-3 pb-3 text-sm"', 'class="comment-list"'],
  [
    `class="cursor-pointer p-1 text-sm leading-none text-faint hover:text-ink${RING}"`,
    'class="comment-remove"',
  ],
  [
    'class="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-[20px] bg-ink/90 px-4.5 py-2.5 text-sm text-canvas"',
    'class="toast"',
  ],
  [
    'class="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 max-w-[470px]"',
    'class="signup-form"',
  ],
  ['class="flex flex-col gap-1"', 'class="signup-field"'],
  ['class="text-xs text-subtle"', 'class="signup-label"'],
  [`class="rounded-md border border-line p-2 text-sm${RING}"`, 'class="signup-input"'],
  ['class="text-xs text-danger-strong"', 'class="signup-error"'],
  [
    `class="cursor-pointer rounded-lg bg-brand p-2 text-sm font-semibold text-white${RING}"`,
    'class="signup-submit"',
  ],
  // feed-liked-count 는 다른 곳과 겹치지 않는 조합이라 마지막에 둔다
  ['class="text-sm text-faint"', 'class="feed-liked-count"'],
  // E-2 에서 통째로 사라진 두 이름은 되살려 넣는다
  ['<ul class="@2col:grid @2col:grid-cols-2 @2col:gap-6" aria-label="피드 목록"', '<ul class="feed-list" aria-label="피드 목록"'],
  ['<section aria-label=', '<section class="section" aria-label='],
];

// H-3 에서 사진에 width·height 를 달았다. 브라우저가 비율을 미리 알아야 사진이
// 도착하기 전에 자리를 비워두고, 그래야 아래 글이 안 밀린다.
// B-3 시점 코드에는 그 두 속성이 없으므로 그때와 견줄 때는 떼고 본다.
// 화면에 보이는 것은 이 속성으로 달라지지 않는다 — 자리를 미리 잡느냐만 달라진다.
export function withoutH3Sizing(html: string): string {
  return html.replace(/ width="640" height="640"/g, '');
}

/** E-2 유틸리티를 B-3 시점 클래스 이름으로 되돌린 HTML */
export function toB3Classes(html: string): string {
  let out = withoutH3Sizing(html);
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

// E-6 에서 프로필 자리가 들여온 Avatar 로 바뀌었다. 서버에서 그린 결과에는 <img> 가 없고
// 대체 글자만 있다. 달라진 그 자리를 같은 표시로 맞춰 두고 나머지를 견주기 위한 것.
export function withSameAvatar(html: string): string {
  return html
    .replace(/<link rel="preload"[^>]*\/>/g, '')
    .replace(/<img class="size-8 rounded-full object-cover"[^>]*\/>/g, '[프로필자리]')
    .replace(/<span data-slot="avatar"[\s\S]*?<\/span><\/span>/g, '[프로필자리]')
    .replace('class="flex items-center gap-2.5 p-3"', 'class="flex items-center gap-2.5"')
    // E-7 에서 머리 구역이 담긴 통의 폭을 보게 됐다. 좁은 통에서는 이 글자들이
    // 아무 일도 안 하므로, B-3 시점과 견줄 때는 걷어내고 본다.
    // 카드가 여러 장이라 전부 바꾼다 — 첫 장만 바꾸면 나머지가 남는다.
    .replace(/ @lg:gap-4"/g, '"')
    .replace(/ @lg:text-base"/g, '"')
    // E-7 에서 더보기 자리의 문자가 그림으로 바뀌었다. 아바타 자리와 같은 방식으로
    // 그 자리만 옛 문자로 맞춰 두고 나머지를 견준다.
    .replace(/<svg [^>]*lucide-ellipsis[^>]*>[\s\S]*?<\/svg>/g, '⋯');
}

// E-7 에서 좋아요 버튼이 글자('♡ 좋아요')에서 아이콘으로 바뀌었다.
// 아바타 자리와 같은 방식으로, 달라진 그 버튼만 양쪽을 같은 표시로 맞추고 나머지를 견준다.
// 개수 줄('좋아요 3개')은 그대로라 비교 대상에 남는다.
export function withSameLikeArea(html: string): string {
  return (
    html
      // 살아 있는 쪽 — 아이콘 버튼(눌림 여부와 상관없이 클래스가 같다)
      .replace(/<button class="cursor-pointer p-2[^"]*"[\s\S]*?<\/button>/g, '[좋아요자리]')
      // B-3 시점 — 글자 버튼
      .replace(/<button class="like-button(?: liked)?"[^>]*>[^<]*<\/button>/g, '[좋아요자리]')
  );
}

/** 카드 몸통이 들여온 것으로 바뀌어 감싸는 칸이 늘었다. 학생이 보는 글자만 남겨 견준다. */
export function toVisibleText(html: string): string {
  return withSameLikeArea(withSameAvatar(html))
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .join('|');
}
