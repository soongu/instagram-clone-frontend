// apps/web-spa/src/lib/h3-vitals.test.ts
//
// 재는 코드를 재는 판이다.
//
// jsdom 은 largest-contentful-paint 도 layout-shift 도 모른다. 그래서 여기서는
// PerformanceObserver 를 우리 것으로 갈아 끼우고 엔트리를 손으로 흘려보낸다.
// 진짜 숫자는 브라우저에서 나오고, 이 판이 지키는 것은 "무엇을 세고 무엇을 안 세는가" 다.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  countFeedImages,
  observeVitals,
  onFeedImagesSettled,
  type VitalsReport,
} from './h3-vitals';

type Listener = (list: { getEntries: () => unknown[] }) => void;

/** 지금 살아 있는 관찰자들 — 엔트리를 흘려보낼 때 쓴다 */
const observers = new Map<string, Listener[]>();
let disconnected = 0;

const realObserver = globalThis.PerformanceObserver;

class FakePerformanceObserver {
  static supportedEntryTypes: string[] = [
    'largest-contentful-paint',
    'layout-shift',
    'event',
  ];

  constructor(private readonly listener: Listener) {}

  observe({ type }: { type: string }) {
    const list = observers.get(type) ?? [];
    list.push(this.listener);
    observers.set(type, list);
  }

  disconnect() {
    disconnected += 1;
  }
}

/** 그 종류를 보고 있는 관찰자들에게 엔트리를 흘려보낸다 */
function emit(type: string, entries: unknown[]) {
  for (const listener of observers.get(type) ?? []) {
    listener({ getEntries: () => entries });
  }
}

beforeEach(() => {
  observers.clear();
  disconnected = 0;
  globalThis.PerformanceObserver = FakePerformanceObserver as unknown as typeof PerformanceObserver;
  FakePerformanceObserver.supportedEntryTypes = [
    'largest-contentful-paint',
    'layout-shift',
    'event',
  ];
});

afterEach(() => {
  globalThis.PerformanceObserver = realObserver;
});

/** 탭을 떠난 것처럼 만든다 — jsdom 은 늘 '보고 있는 중' 이라고 답한다 */
function leaveScreen() {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => 'hidden',
  });
  document.dispatchEvent(new Event('visibilitychange'));
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => 'visible',
  });
}

/** 보고를 모아 마지막 것을 돌려주는 도우미 */
function collect() {
  const reports: VitalsReport[] = [];
  const stop = observeVitals((report) => reports.push(report));
  return { reports, stop, last: () => reports[reports.length - 1] };
}

describe('LCP — 가장 큰 것이 언제 그려졌나', () => {
  it('마지막에 온 것이 답이다', () => {
    const { last } = collect();

    emit('largest-contentful-paint', [{ startTime: 300, size: 100, element: null }]);
    emit('largest-contentful-paint', [{ startTime: 1080, size: 220900, element: null }]);

    expect(last().lcp).toBe(1080);
  });

  it('무엇이 가장 컸는지도 함께 알려준다', () => {
    const { last } = collect();
    const img = document.createElement('img');
    img.setAttribute('alt', 'jaehoon 의 게시물');

    emit('largest-contentful-paint', [{ startTime: 1080, size: 220900, element: img }]);

    expect(last().lcpElement).toBe('IMG[alt="jaehoon 의 게시물"]');
  });
});

describe('CLS — 얼마나 밀렸나', () => {
  it('밀린 값을 더한다', () => {
    const { last } = collect();

    emit('layout-shift', [
      { value: 0.15709, hadRecentInput: false, sources: [] },
      { value: 0.06434, hadRecentInput: false, sources: [] },
    ]);

    expect(last().cls).toBeCloseTo(0.22143, 5);
    expect(last().shifts).toHaveLength(2);
  });

  it('사용자가 방금 누른 뒤의 밀림은 안 센다', () => {
    // 누르면 화면이 바뀌는 것은 당연하다. 그것까지 세면 정상 동작이 벌점이 된다.
    const { last } = collect();

    emit('layout-shift', [
      { value: 0.2, hadRecentInput: false, sources: [] },
      { value: 9.9, hadRecentInput: true, sources: [] },
    ]);

    expect(last().cls).toBeCloseTo(0.2, 5);
    expect(last().shifts).toHaveLength(1);
  });

  it('누가 밀었는지를 요소 이름으로 남긴다', () => {
    const { last } = collect();
    const li = document.createElement('li');
    const div = document.createElement('div');
    div.className = 'px-3 py-1 text-sm';

    emit('layout-shift', [
      { value: 0.1, hadRecentInput: false, sources: [{ node: li }, { node: div }] },
    ]);

    expect(last().shifts[0].sources).toEqual(['LI', 'DIV.px-3']);
  });
});

describe('언제 보고하나 — CLS 는 끝까지 확정되지 않는다', () => {
  // 관찰자는 새 엔트리가 있을 때만 운다. 그런데 밀림을 다 고쳐서 엔트리가 0건이면
  // 아무도 안 울고, 그러면 "다 왔는데 안 밀렸다" 는 사실을 영영 못 본다.
  // 그래서 다 불러온 시점과 화면을 떠나는 시점에 한 번씩 더 보고한다.
  it('다 불러오면 그때까지의 값을 한 번 더 보고한다', () => {
    const { reports } = collect();
    const before = reports.length;

    window.dispatchEvent(new Event('load'));

    expect(reports.length).toBe(before + 1);
  });

  it('화면을 떠날 때 마지막으로 보고한다', () => {
    const { reports } = collect();
    const before = reports.length;

    leaveScreen();

    expect(reports.length).toBe(before + 1);
  });

  it('보고 있는 동안에는 떠난 것으로 치지 않는다', () => {
    // visibilitychange 는 돌아올 때도 온다. 그때까지 보고하면 값이 두 번 세어진다.
    const { reports } = collect();
    const before = reports.length;

    document.dispatchEvent(new Event('visibilitychange'));

    expect(reports).toHaveLength(before);
  });

  it('멈춘 뒤에는 떠나도 보고하지 않는다', () => {
    const { reports, stop } = collect();
    stop();
    const after = reports.length;

    window.dispatchEvent(new Event('load'));
    leaveScreen();

    expect(reports).toHaveLength(after);
  });
});

describe('관찰을 멈추면', () => {
  it('더 보고하지 않는다', () => {
    const { reports, stop } = collect();
    const before = reports.length;

    stop();

    expect(disconnected).toBeGreaterThan(0);
    expect(reports).toHaveLength(before);
  });
});

describe('브라우저가 그 지표를 모르면', () => {
  it('터지지 않고 조용히 넘어간다', () => {
    // 사파리는 오랫동안 layout-shift 를 몰랐다. 재는 코드가 앱을 죽이면 안 된다.
    FakePerformanceObserver.supportedEntryTypes = ['largest-contentful-paint'];
    const { last } = collect();

    emit('largest-contentful-paint', [{ startTime: 500, size: 10, element: null }]);

    expect(last().lcp).toBe(500);
    expect(last().cls).toBe(0);
    expect(observers.has('layout-shift')).toBe(false);
  });
});

describe('사진이 다 왔는지 — CLS 0 의 두 가지 뜻을 가르는 자리', () => {
  function drawFeed(count: number) {
    const host = document.createElement('div');
    for (let i = 0; i < count; i++) {
      const img = document.createElement('img');
      img.setAttribute('alt', `jaehoon${i} 의 게시물`);
      host.appendChild(img);
    }
    document.body.appendChild(host);
    return host;
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('다 왔으면 잰 값을 믿어도 된다', () => {
    drawFeed(10);

    const result = countFeedImages();

    expect(result).toEqual({ total: 10, loaded: 10, allLoaded: true });
  });

  it('한 장이라도 안 왔으면 믿으면 안 된다', () => {
    drawFeed(10);
    // test-setup 이 모든 이미지를 "받아온 것" 으로 답하게 해뒀다.
    // 여기서는 한 장만 아직 안 온 것으로 돌려놓는다.
    const [first] = document.querySelectorAll('img');
    Object.defineProperty(first, 'naturalWidth', { configurable: true, get: () => 0 });

    const result = countFeedImages();

    expect(result).toEqual({ total: 10, loaded: 9, allLoaded: false });
  });

  it('사진이 아예 없으면 잰 것이 없는 것이다', () => {
    // 한 장도 없는데 allLoaded 가 참이면 "다 왔다" 로 읽힌다.
    const result = countFeedImages();

    expect(result).toEqual({ total: 0, loaded: 0, allLoaded: false });
  });
});

describe('사진이 다 오는 순간을 잡는다', () => {
  // SPA 는 사진이 최초 HTML 에 없다. 데이터를 받아온 뒤에 React 가 붙이므로
  // window 의 load 는 사진이 오기 한참 전에 끝나 있다.
  // 그래서 "다 왔다" 는 순간을 따로 잡아야 한다.
  function addImage(loaded: boolean) {
    const img = document.createElement('img');
    img.setAttribute('alt', 'jaehoon 의 게시물');
    Object.defineProperty(img, 'naturalWidth', {
      configurable: true,
      get: () => (loaded ? 1 : 0),
    });
    document.body.appendChild(img);
    return img;
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('이미 다 와 있으면 곧바로 알려준다', () => {
    addImage(true);
    let called = 0;

    onFeedImagesSettled(() => (called += 1));

    expect(called).toBe(1);
  });

  it('아직이면 마지막 한 장이 도착할 때 알려준다', () => {
    const first = addImage(true);
    const second = addImage(false);
    let called = 0;

    onFeedImagesSettled(() => (called += 1));
    expect(called).toBe(0);

    // 아직 한 장이 안 왔으므로 다른 사진이 끝나도 조용하다
    first.dispatchEvent(new Event('load'));
    expect(called).toBe(0);

    Object.defineProperty(second, 'naturalWidth', { configurable: true, get: () => 1 });
    second.dispatchEvent(new Event('load'));

    expect(called).toBe(1);
  });

  it('한 번만 알려준다', () => {
    const only = addImage(false);
    let called = 0;
    onFeedImagesSettled(() => (called += 1));

    Object.defineProperty(only, 'naturalWidth', { configurable: true, get: () => 1 });
    only.dispatchEvent(new Event('load'));
    only.dispatchEvent(new Event('load'));

    expect(called).toBe(1);
  });

  it('그만두면 도착해도 안 알려준다', () => {
    const only = addImage(false);
    let called = 0;
    const stop = onFeedImagesSettled(() => (called += 1));

    stop();
    Object.defineProperty(only, 'naturalWidth', { configurable: true, get: () => 1 });
    only.dispatchEvent(new Event('load'));

    expect(called).toBe(0);
  });
});

describe('앱이 실제로 자리를 미리 잡아두는가', () => {
  // 이 가드가 없으면 누가 width·height 를 지워도 아무도 안 알려준다.
  // 화면은 똑같이 보이고 테스트도 전부 초록인 채로 밀림만 돌아온다.
  it('PostImage 가 width 와 height 를 달고 있다', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const source = readFileSync(
      resolve(import.meta.dirname, '../components/PostImage.tsx'),
      'utf-8',
    );

    expect(source).toContain('width={640}');
    expect(source).toContain('height={640}');
  });

  // 재는 코드를 만들어만 두고 안 부르면 아무 숫자도 안 나온다.
  it('앱이 재기를 그리기 전에 켠다', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const entry = readFileSync(resolve(import.meta.dirname, '../main.tsx'), 'utf-8');

    expect(entry).toContain('observeVitals(');
    expect(entry.indexOf('observeVitals(')).toBeLessThan(entry.indexOf('createRoot('));
  });
});

describe('보고는 계속 갱신된다', () => {
  it('새 엔트리가 올 때마다 그때까지의 값을 준다', () => {
    const { reports } = collect();
    const before = reports.length;

    emit('largest-contentful-paint', [{ startTime: 300, size: 1, element: null }]);
    emit('layout-shift', [{ value: 0.1, hadRecentInput: false, sources: [] }]);

    const added = reports.slice(before);
    expect(added).toHaveLength(2);
    expect(added[0]).toMatchObject({ lcp: 300, cls: 0 });
    expect(added[1]).toMatchObject({ lcp: 300, cls: 0.1 });
  });
});
