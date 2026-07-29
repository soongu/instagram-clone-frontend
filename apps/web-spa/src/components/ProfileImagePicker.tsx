// apps/web-spa/src/components/ProfileImagePicker.tsx
import { useRef, useState } from 'react';
import { Button } from './Button';

interface ProfileImagePickerProps {
  // 고른 파일 이름을 위로 올려준다 — 없으면 혼자 보여주기만 한다
  onPick?: (fileName: string) => void;
}

export function ProfileImagePicker({ onPick }: ProfileImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickedName, setPickedName] = useState('');

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setPickedName(file.name);
    onPick?.(file.name);
  }

  return (
    <div className="profile-picker">
      {/* 파일 선택 창을 여는 건 React 로 표현할 수 없다. 손잡이를 잡고 직접 시킨다. */}
      <input
        className="profile-picker-input"
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleChange}
        aria-label="프로필 사진 파일"
      />
      <Button
        className="profile-picker-button"
        onClick={() => fileInputRef.current?.click()}
      >
        프로필 사진 고르기
      </Button>
      <span className="profile-picker-name">{pickedName || '아직 고르지 않았어요'}</span>
    </div>
  );
}
