// apps/web-spa/src/components/Avatar.tsx

interface AvatarProps {
  username: string;
  profileImageUrl: string;
}

export function Avatar({ username, profileImageUrl }: AvatarProps) {
  return (
    <div className="avatar">
      <img className="avatar-image" src={profileImageUrl} alt={`${username} 프로필 사진`} />
      <span className="avatar-name">{username}</span>
    </div>
  );
}
