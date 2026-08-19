// apps/web-next/app/components/TextScaleStyle.tsx
import { cookies } from 'next/headers';

// 이 조각만 요청 때 정해진다. 쿠키는 요청이 와야만 알 수 있는 값이라
// 미리 그려둘 수 없다 — 그래서 이 하나만 따로 떼어 <Suspense> 안에 둔다.
export async function TextScaleStyle() {
  const jar = await cookies();
  const large = jar.get('text-scale')?.value === 'large';

  if (!large) {
    return null;
  }

  return <style>{`body { font-size: 1.125rem; }`}</style>;
}
