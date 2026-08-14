// C-3 Step 2 채증 — 두 문법이 런타임에서 정말 같은가 (내부 검증용)
import { describe, expect, it } from 'vitest';
import { createContext, useContext } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const Ctx = createContext<string>('기본값');

function Reader() {
  return <p>{useContext(Ctx)}</p>;
}

describe('<Context value> 와 <Context.Provider value>', () => {
  it('같은 HTML 을 낸다', () => {
    const modern = renderToStaticMarkup(<Ctx value="넣은 값"><Reader /></Ctx>);
    const legacy = renderToStaticMarkup(<Ctx.Provider value="넣은 값"><Reader /></Ctx.Provider>);

    expect(modern).toBe('<p>넣은 값</p>');
    expect(legacy).toBe(modern);
  });

  it('Provider 를 안 씌우면 기본값이 조용히 쓰인다 — 에러도 경고도 없다', () => {
    expect(renderToStaticMarkup(<Reader />)).toBe('<p>기본값</p>');
  });

  it('Context 자체는 값을 안 들고 있다 — 같은 Context 도 Provider 마다 다른 값을 낸다', () => {
    const html = renderToStaticMarkup(
      <>
        <Ctx value="왼쪽"><Reader /></Ctx>
        <Ctx value="오른쪽"><Reader /></Ctx>
      </>,
    );

    expect(html).toBe('<p>왼쪽</p><p>오른쪽</p>');
  });
});
