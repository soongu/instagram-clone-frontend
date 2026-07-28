// apps/web-spa/src/components/IconButton.tsx
import type { ComponentProps } from 'react';
import { Button } from './Button';

// Button 이 받는 props 를 그대로 물려받는다. 여기에 다시 적지 않는다.
// 다만 글자 대신 기호만 보이는 버튼이라, 읽어줄 이름은 있으면 좋은 게 아니라 필수다.
type IconButtonProps = ComponentProps<typeof Button> & {
  'aria-label': string;
};

// 하는 일이 거의 없다. 타입 한 곳을 좁히는 것이 이 컴포넌트의 존재 이유다.
export function IconButton(props: IconButtonProps) {
  return <Button {...props} />;
}
