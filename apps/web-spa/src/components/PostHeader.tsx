// apps/web-spa/src/components/PostHeader.tsx
import { Avatar } from './Avatar';

interface PostHeaderProps {
  username: string;
  profileImageUrl: string;
}

export function PostHeader({ username, profileImageUrl }: PostHeaderProps) {
  return <Avatar username={username} profileImageUrl={profileImageUrl} />;
}
