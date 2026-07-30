// apps/web-spa/src/components/PostImage.tsx

interface PostImageProps {
  imageUrl: string;
  username: string;
  onLike: () => void;
}

export function PostImage({ imageUrl, username, onLike }: PostImageProps) {
  function handleDoubleClick(event: React.MouseEvent<HTMLImageElement>) {
    // 더블클릭이 이미지를 선택 상태로 만드는 브라우저 기본 동작을 막는다
    event.preventDefault();
    onLike();
  }

  return (
    <img
      className="w-full cursor-pointer"
      src={imageUrl}
      alt={`${username} 의 게시물`}
      onDoubleClick={handleDoubleClick}
    />
  );
}
