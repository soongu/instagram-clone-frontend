// apps/web-spa/src/components/ConfirmDialog.tsx
import { useConfirmStore } from '../stores/useConfirmStore';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from './ui/dialog';

// 앱에 하나만 있는 확인 상자.
// 누가 물어보라고 했는지는 몰라도 된다 — store 에 적힌 것만 그린다.
export function ConfirmDialog() {
  const { request, confirm, close } = useConfirmStore();

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
