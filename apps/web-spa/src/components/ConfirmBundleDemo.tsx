// apps/web-spa/src/components/ConfirmBundleDemo.tsx
//
// 조각을 여러 개 고를 때 한 번에 묶고 싶어지는 자리를 남겨둔 판이다.
// (a) 는 일부러 터지게 뒀다 — 무엇이 터지는지 눈으로 봐야 다음에 알아본다.
import { useShallow } from 'zustand/react/shallow';
import { useConfirmStore } from '../stores/useConfirmStore';

// (a) 묶어서 고른다. 부를 때마다 새 객체가 나온다.
export function BundledReader() {
  const { message, isOpen } = useConfirmStore((state) => ({
    message: state.request?.message ?? '(없음)',
    isOpen: state.request !== null,
  }));

  return <p>{`(a) ${isOpen ? '열림' : '닫힘'} / ${message}`}</p>;
}

// (b) 같은 것을 useShallow 로 감싼다. 안쪽 값이 그대로면 앞서 만든 객체를 다시 준다.
export function ShallowReader() {
  const { message, isOpen } = useConfirmStore(
    useShallow((state) => ({
      message: state.request?.message ?? '(없음)',
      isOpen: state.request !== null,
    })),
  );

  return <p>{`(b) ${isOpen ? '열림' : '닫힘'} / ${message}`}</p>;
}

// (d) 계산해서 돌려준다. 매번 새로 계산하는데도 괜찮다 —
// 나오는 것이 문자열이라 같은 글자면 같은 값으로 친다.
export function DerivedStringReader() {
  const label = useConfirmStore((state) =>
    state.request === null ? '닫힘' : `열림: ${state.request.message}`,
  );

  return <p>{`(d) ${label}`}</p>;
}

// (e) 배열로 묶는다. 개수가 둘이어서가 아니라 배열이 매번 새로 만들어져서 터진다.
export function ArrayReader() {
  const [message, isOpen] = useConfirmStore((state) => [
    state.request?.message ?? '(없음)',
    state.request !== null,
  ]);

  return <p>{`(e) ${isOpen ? '열림' : '닫힘'} / ${message}`}</p>;
}

// (c) 묶지 않고 조각을 따로 고른다. 우리 ConfirmDialog 가 쓰는 방식이다.
export function SeparateReader() {
  const request = useConfirmStore((state) => state.request);
  const message = request?.message ?? '(없음)';

  return <p>{`(c) ${request !== null ? '열림' : '닫힘'} / ${message}`}</p>;
}
