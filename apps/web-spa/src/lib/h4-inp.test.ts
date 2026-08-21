// apps/web-spa/src/lib/h4-inp.test.ts
//
// INP 를 세는 규칙을 재는 판이다.
//
// jsdom 은 'event' 엔트리를 안 만든다. 진짜 숫자는 브라우저에서 진짜로 눌러야 나오고,
// 이 판이 지키는 것은 "여러 이벤트를 어떻게 한 상호작용으로 묶고, 그중 무엇을 답으로 고르는가" 다.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { observeVitals, type VitalsReport } from './h3-vitals';

type Listener = (list: { getEntries: () => unknown[] }) => void;

const observers = new Map<string, Listener[]>();
const realObserver = globalThis.PerformanceObserver;

class FakePerformanceObserver {
  static supportedEntryTypes: string[] = ['largest-contentful-paint', 'layout-shift', 'event'];

  constructor(private readonly listener: Listener) {}

  observe({ type }: { type: string }) {
    const list = observers.get(type) ?? [];
    list.push(this.listener);
    observers.set(type, list);
  }

  disconnect() {}
}

function emit(type: string, entries: unknown[]) {
  for (const listener of observers.get(type) ?? []) {
    listener({ getEntries: () => entries });
  }
}

/** 상호작용 하나가 내는 이벤트 한 건 */
function event(interactionId: number, duration: number, name = 'click') {
  return { interactionId, duration, name, startTime: 0, processingStart: 0, processingEnd: 0 };
}

beforeEach(() => {
  observers.clear();
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

function collect() {
  const reports: VitalsReport[] = [];
  const stop = observeVitals((report) => reports.push(report));
  return { reports, stop, last: () => reports[reports.length - 1] };
}

describe('INP — 아무도 안 눌렀을 때', () => {
  it('0 이 아니라 없음이다', () => {
    // 0 으로 두면 "아주 빠르다" 로 읽힌다. 잰 적이 없는 것과 빠른 것은 다르다.
    // H-3 의 「CLS 0 이 두 가지 뜻」과 같은 자리다.
    const { last } = collect();

    window.dispatchEvent(new Event('load'));

    expect(last().inp).toBeNull();
    expect(last().interactions).toBe(0);
  });
});

describe('INP — 한 번 누르면 이벤트가 여러 개 나온다', () => {
  it('같은 상호작용은 가장 긴 것 하나로 친다', () => {
    // 하트를 한 번 누르면 pointerdown · pointerup · click 이 각각 기록된다.
    // 셋을 따로 세면 한 번 누른 것이 세 번으로 보인다.
    const { last } = collect();

    emit('event', [
      event(7, 16, 'pointerdown'),
      event(7, 32, 'pointerup'),
      event(7, 24, 'click'),
    ]);

    expect(last().interactions).toBe(1);
    expect(last().inp).toBe(32);
  });

  it('나눠서 도착해도 같은 상호작용이면 하나다', () => {
    const { last } = collect();

    emit('event', [event(7, 16, 'pointerdown')]);
    emit('event', [event(7, 32, 'click')]);

    expect(last().interactions).toBe(1);
    expect(last().inp).toBe(32);
  });
});

describe('INP — 무엇을 상호작용으로 치는가', () => {
  it('interactionId 가 없는 것은 안 센다', () => {
    // 스크롤 같은 것도 event 로 들어오는데 그것은 사용자가 답을 기다리는 일이 아니다.
    // 브라우저가 interactionId 를 0 으로 줘서 갈라준다.
    const { last } = collect();

    emit('event', [event(0, 500, 'pointermove'), event(3, 24, 'click')]);

    expect(last().interactions).toBe(1);
    expect(last().inp).toBe(24);
  });

  it('셀 것이 하나도 없으면 0 이 아니라 없음이다', () => {
    // 스크롤만 하고 한 번도 안 누른 사람. 엔트리는 왔지만 셀 것이 없다.
    // 여기서 0 을 돌려주면 콘솔에 "INP 0ms" 가 찍혀 아주 빠른 앱으로 보인다.
    const { last } = collect();

    emit('event', [event(0, 500, 'pointermove'), event(0, 900, 'pointermove')]);

    expect(last().interactions).toBe(0);
    expect(last().inp).toBeNull();
  });
});

describe('INP — 여럿 중 무엇이 답인가', () => {
  it('50건 미만이면 가장 나쁜 하나가 곧 INP 다', () => {
    // 아홉 번이 멀쩡해도 한 번이 나쁘면 그 한 번이 답이다.
    // 실제로 우리 앱을 다섯 번 재면 네 번은 32ms 인데 한 번이 248ms 로 나온다.
    const { last } = collect();

    emit(
      'event',
      [248, 32, 24, 24, 24, 24, 24, 24, 24, 24].map((duration, index) =>
        event(index + 1, duration),
      ),
    );

    expect(last().interactions).toBe(10);
    expect(last().inp).toBe(248);
  });

  it('50건이 넘으면 가장 나쁜 것을 하나씩 버린다', () => {
    // 오래 쓰는 사람일수록 딸꾹질을 만날 확률이 높다. 그 한 번으로 앱 전체를
    // 판정하지 않으려고, 상호작용이 50건 늘 때마다 최악을 하나씩 걷어낸다.
    const { last } = collect();

    const durations = [999, ...Array.from({ length: 50 }, () => 40)];
    emit(
      'event',
      durations.map((duration, index) => event(index + 1, duration)),
    );

    expect(last().interactions).toBe(51);
    expect(last().inp).toBe(40);
  });
});

describe('INP — 브라우저가 event 를 모르면', () => {
  it('터지지 않고 조용히 넘어간다', () => {
    FakePerformanceObserver.supportedEntryTypes = ['largest-contentful-paint'];
    const { last } = collect();

    emit('largest-contentful-paint', [{ startTime: 500, size: 10, element: null }]);

    expect(last().inp).toBeNull();
    expect(observers.has('event')).toBe(false);
  });
});
