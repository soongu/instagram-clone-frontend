// apps/web-spa/src/components/CommentList.tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from './ui/dialog';
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
  // 지우기 직전에 한 번 물어본다. 어느 댓글을 물어보는 중인지만 기억하면 된다.
  const [pendingId, setPendingId] = useState<number | null>(null);

  function confirmRemove() {
    if (pendingId !== null) {
      onRemove?.(pendingId);
    }

    setPendingId(null);
  }

  return (
    <>
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
                onClick={() => setPendingId(comment.id)}
              >
                <X className="size-4" />
              </IconButton>
            )}
          </>
        )}
      />
      <Dialog open={pendingId !== null} onOpenChange={(open) => !open && setPendingId(null)}>
        <DialogContent showCloseButton={false}>
          <DialogTitle>댓글을 지울까요?</DialogTitle>
          <DialogDescription>지운 댓글은 되돌릴 수 없습니다.</DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingId(null)}>
              취소
            </Button>
            <Button onClick={confirmRemove}>지우기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
