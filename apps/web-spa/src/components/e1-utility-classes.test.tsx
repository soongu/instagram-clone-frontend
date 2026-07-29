// apps/web-spa/src/components/e1-utility-classes.test.tsx
// E-1 교안이 인용하는 클래스 문자열을 채증한다 (내부 검증용)
//
// globals.css 파일 내용과 빌드 산출 CSS 에 대한 관찰은 이 파일로 못 잡는다.
// @tailwindcss/vite 가 .css?raw 임포트를 가로채 빈 문자열을 돌려주고,
// 이 워크스페이스에는 @types/node 가 없어 fs 도 못 쓴다.
// 그쪽 사실은 scratch/e1-build-observations.txt 에 재현 명령과 함께 기록해 뒀다.
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { Avatar } from './Avatar';

describe('Step 3 — Avatar 가 유틸리티로 넘어갔다', () => {
  it('교안이 인용하는 클래스 문자열 그대로 그린다', () => {
    const html = renderToStaticMarkup(
      <Avatar username="jaehoon" profileImageUrl="https://example.com/a.jpg" />,
    );

    expect(html).toContain('class="flex items-center gap-2.5 p-3"');
    expect(html).toContain('class="size-8 rounded-full object-cover"');
    expect(html).toContain('class="text-sm font-semibold"');
  });

  it('손으로 지었던 avatar 계열 클래스 이름은 더 이상 나오지 않는다', () => {
    const html = renderToStaticMarkup(
      <Avatar username="minji" profileImageUrl="https://example.com/b.jpg" />,
    );

    expect(html).not.toContain('"avatar"');
    expect(html).not.toContain('"avatar-image"');
    expect(html).not.toContain('"avatar-name"');
  });

  it('바뀐 것은 스타일뿐이라 그리는 내용은 그대로다', () => {
    const html = renderToStaticMarkup(
      <Avatar username="jaehoon" profileImageUrl="https://example.com/a.jpg" />,
    );

    expect(html).toContain('jaehoon');
    expect(html).toContain('src="https://example.com/a.jpg"');
    expect(html).toContain('alt="jaehoon 프로필 사진"');
  });
});
