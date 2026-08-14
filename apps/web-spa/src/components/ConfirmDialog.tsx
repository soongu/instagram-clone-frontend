// apps/web-spa/src/components/ConfirmDialog.tsx
import { useConfirmStore } from '../stores/useConfirmStore';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from './ui/dialog';

// 앱에 하나만 있는 확인 상자.
// 누가 물어보라고 했는지는 몰라도 된다 — store 에 적힌 것만 그린다.
export function ConfirmDialog() {
  // 여기는 request 가 바뀌면 반드시 다시 그려져야 한다. 그래서 그것만 고른다.
  // 나머지 둘은 안 바뀌는 함수라 골라 담아도 다시 그리는 이유가 되지 않는다.
  const request = useConfirmStore((state) => state.request);
  const confirm = useConfirmStore((state) => state.confirm);
  const close = useConfirmStore((state) => state.close);

  return (
    <Dialog open={request !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent showCloseButton={false}>
        <DialogTitle>{request?.message}</DialogTitle>
        <DialogDescription>이 작업은 되돌릴 수 없습니다.</DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            취소
          </Button>
          <Button onClick={confirm}>지우기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
