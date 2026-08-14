// C-4 Step 7 실측용 — 두 상자를 서로 반대편에 담아보고 무엇이 깨지는지 본다.
// 앱에는 안 붙인다. 어느 쪽도 정답이 아니라는 것을 숫자로 보이려고 만든 판이다.
import { useSearchParams } from 'react-router';
import { create } from 'zustand';
import { Button } from '../src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '../src/components/ui/dialog';

// ── (A) 삭제 확인을 주소에 담아본다 ────────────────────────────────
// 지울 대상 번호는 주소에 적을 수 있다. 확인했을 때 할 일은 적을 수 없다.
export function ConfirmInUrl({ onRemove }: { onRemove: (id: number) => void }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const pending = searchParams.get('confirm');

  return (
    <>
      <button type="button" onClick={() => setSearchParams({ confirm: '3' })}>
        3번 댓글 지우기
      </button>
      <Dialog open={pending !== null} onOpenChange={(open) => !open && setSearchParams({})}>
        <DialogContent showCloseButton={false}>
          <DialogTitle>{`${pending}번 댓글을 지울까요?`}</DialogTitle>
          <DialogDescription>이 작업은 되돌릴 수 없습니다.</DialogDescription>
          <DialogFooter>
            <Button
              onClick={() => {
                onRemove(Number(pending));
                setSearchParams({});
              }}
            >
              지우기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── (B) 게시물 모달을 store 에 담아본다 ─────────────────────────────
interface ModalState {
  openId: number | null;
  open: (id: number) => void;
  close: () => void;
}

export const useModalStore = create<ModalState>()((set) => ({
  openId: null,
  open: (id) => set({ openId: id }),
  close: () => set({ openId: null }),
}));

export function PostModalInStore({ id }: { id: number }) {
  const openId = useModalStore((state) => state.openId);
  const open = useModalStore((state) => state.open);
  const close = useModalStore((state) => state.close);

  return (
    <>
      <button type="button" onClick={() => open(id)}>
        댓글 모두 보기
      </button>
      <Dialog open={openId === id} onOpenChange={(next) => !next && close()}>
        <DialogContent showCloseButton={false}>
          <DialogTitle>{`${id}번 게시물`}</DialogTitle>
        </DialogContent>
      </Dialog>
    </>
  );
}
