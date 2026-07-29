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
    <div className="signup-field">
      <label className="signup-label" htmlFor={id}>
        {label}
      </label>
      <input className="signup-input" id={id} {...inputProps} />
      {error && <p className="signup-error">{error}</p>}
    </div>
  );
}
