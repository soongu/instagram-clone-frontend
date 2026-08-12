// apps/web-spa/src/components/ThemeToggle.tsx
import { useTheme } from '../hooks/useTheme';
import type { ThemeChoice } from '../lib/theme';

// '시스템' 이 함께 있어야 "안 고르겠다" 로 돌아올 길이 생긴다
const OPTIONS: ReadonlyArray<{ value: ThemeChoice; label: string }> = [
  { value: 'light', label: '밝게' },
  { value: 'dark', label: '어둡게' },
  { value: 'system', label: '시스템' },
];

export function ThemeToggle() {
  const { choice, select } = useTheme();

  return (
    <div className="flex gap-0.5 rounded-md border border-line p-0.5" role="group" aria-label="화면 밝기">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={choice === option.value}
          onClick={() => select(option.value)}
          className={`cursor-pointer rounded-md px-2 py-0.5 text-note focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
            choice === option.value ? 'bg-ink font-semibold text-canvas' : 'text-faint'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
