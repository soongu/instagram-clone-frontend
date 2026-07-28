// apps/web-spa/src/components/List.tsx

// 담기는 것의 타입은 쓰는 쪽이 정한다 — 여기서는 T 라는 이름으로만 비워둔다.
// 다만 아무것이나 받지는 않는다. key 로 쓸 id 가 있어야 한다.
interface ListProps<T extends { id: number }> {
  items: T[];
  // 한 줄을 어떻게 그릴지는 쓰는 쪽이 알려준다
  renderItem: (item: T) => React.ReactNode;
  className?: string;
  // 화면 읽어주는 도구에 이 목록이 무엇인지 알려준다
  'aria-label'?: string;
}

export function List<T extends { id: number }>({
  items,
  renderItem,
  className,
  'aria-label': ariaLabel,
}: ListProps<T>) {
  return (
    <ul className={className} aria-label={ariaLabel}>
      {items.map((item) => (
        <li key={item.id}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
