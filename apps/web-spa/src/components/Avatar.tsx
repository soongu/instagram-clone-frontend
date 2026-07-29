// apps/web-spa/src/components/Avatar.tsx

interface AvatarProps {
  username: string;
  profileImageUrl: string;
}

export function Avatar({ username, profileImageUrl }: AvatarProps) {
  return (
    <div className="flex items-center gap-2.5 p-3">
      <img
        className="size-8 rounded-full object-cover"
        src={profileImageUrl}
        alt={`${username} 프로필 사진`}
      />
      <span className="text-sm font-semibold">{username}</span>
    </div>
  );
}
