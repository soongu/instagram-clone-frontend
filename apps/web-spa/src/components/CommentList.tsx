// apps/web-spa/src/components/CommentList.tsx
import { X } from 'lucide-react';
import { useConfirmStore } from '../stores/useConfirmStore';
import { IconButton } from './IconButton';
import { List } from './List';

export interface DraftComment {
  id: number;
  content: string;
}

interface CommentListProps {
  comments: DraftComment[];
  // 지울 수 있는 목록에만 넘긴다 — 안 넘기면 삭제 버튼이 아예 안 그려진다
  onRemove?: (id: number) => void;
}

// 줄줄이 그리는 일은 List 에 맡기고, 한 줄을 어떻게 그릴지만 정한다.
export function CommentList({ comments, onRemove }: CommentListProps) {
  // 물어보라고 부탁만 한다. 상자를 어디에 어떻게 그리는지는 이 컴포넌트가 모른다.
  const { ask } = useConfirmStore();

  return (
    <List
      items={comments}
      className="px-3 pb-3 text-sm"
      renderItem={(comment) => (
        <>
          <strong>me</strong> {comment.content}
          {onRemove && (
            <IconButton
              className="cursor-pointer p-1 text-sm leading-none text-faint hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              aria-label="댓글 삭제"
              onClick={() => ask('댓글을 지울까요?', () => onRemove(comment.id))}
            >
              <X className="size-4" />
            </IconButton>
          )}
        </>
      )}
    />
  );
}
