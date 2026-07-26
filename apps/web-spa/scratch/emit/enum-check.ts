export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}
export type OtherStatus = 'draft' | 'published';
export const POST_STATUS = { DRAFT: 'draft' } as const;
