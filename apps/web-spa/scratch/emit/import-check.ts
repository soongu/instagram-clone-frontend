import { MediaKind, mediaBadge } from './fake-literals';

export function badge(kind: MediaKind): string {
  return mediaBadge(kind);
}
