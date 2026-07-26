import { Post, User } from '../src/types/instagram';
export const p: Post = {
  id: 1, username: 'a', profileImageUrl: '', imageUrl: '',
  mediaKind: 'photo',
  content: '', hashtagNames: [], likeCount: 0, commentCount: 0,
  liked: false, createdAt: '',
};
export function f(user: User): number {
  return user.bio.length;
}
