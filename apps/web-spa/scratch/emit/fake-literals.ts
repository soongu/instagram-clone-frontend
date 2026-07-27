export type MediaKind = 'image' | 'video' | 'carousel';

export function mediaBadge(kind: MediaKind): string {
  return kind;
}
