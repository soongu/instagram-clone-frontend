// apps/web-spa/src/components/TextField.tsx
import type { ComponentProps } from 'react';

// input 이 원래 받는 것 전부에 라벨과 에러 메시지를 더한다.
// register 가 펼쳐주는 name·onChange·onBlur·ref 도 여기로 그대로 흘러 들어간다.
type TextFieldProps = ComponentProps<'input'> & {
  id: string;
  label: string;
  error?: string;
};

export function TextField({ id, label, error, ...inputProps }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-subtle" htmlFor={id}>
        {label}
      </label>
      <input
        className="rounded-md border border-line p-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        id={id}
        {...inputProps}
      />
      {error && <p className="text-xs text-danger-strong">{error}</p>}
    </div>
  );
}
