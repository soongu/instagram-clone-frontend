// C-4 이후 확인 상자를 쓰는 판을 홀로 그려보는 도우미 (내부 검증용)
//
// C-4 Step 2 에서 확인 상자가 CommentList 밖으로 나가 앱에 하나만 남았다.
// 그래서 CommentList 만 홀로 그리면 물어보는 상자가 화면에 없다.
// c3-theme-harness 의 withTheme 과 같은 성격 — 화면에는 아무것도 안 더하고
// 앱에서 늘 함께 있는 것만 옆에 세워준다.
import { ConfirmDialog } from '../src/components/ConfirmDialog';

export function withConfirm(ui: React.ReactNode) {
  return (
    <>
      {ui}
      <ConfirmDialog />
    </>
  );
}
