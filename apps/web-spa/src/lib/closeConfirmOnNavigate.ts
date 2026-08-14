// apps/web-spa/src/lib/closeConfirmOnNavigate.ts
import type { DataRouter } from 'react-router';
import { useConfirmStore } from '../stores/useConfirmStore';

// 확인 상자는 라우터 바깥에 있어서 화면을 옮겨도 그대로 떠 있다.
// 화면이 바뀌면 물어보던 것은 무효니까 닫아준다.
//
// 여기는 컴포넌트가 아니다. 훅을 부를 수 없는 자리에서 store 를 직접 건드린다.
// useConfirmStore 는 훅이면서 동시에 getState·setState·subscribe 를 달고 있는 객체다.
export function closeConfirmOnNavigate(router: DataRouter) {
  // 라우터는 주소 말고도 여러 이유로 알림을 준다. 주소가 실제로 바뀐 때만 닫는다.
  let lastKey = router.state.location.key;

  return router.subscribe((state) => {
    if (state.location.key === lastKey) {
      return;
    }

    lastKey = state.location.key;
    useConfirmStore.getState().close();
  });
}
