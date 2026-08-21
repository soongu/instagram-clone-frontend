// apps/web-spa/src/lib/h3-vitals.ts
//
// 사용자가 실제로 겪는 것을 브라우저에게 직접 물어본다.
//
// 브라우저는 화면을 그리면서 "가장 큰 것이 언제 그려졌는지"(LCP) 와
// "무엇이 얼마나 밀렸는지"(CLS) 를 스스로 기록해 둔다. 우리는 그것을 받아 적기만 하면 된다.
// 개발자 도구로도 볼 수 있지만, 코드로 받아두면 나중에 그대로 밖으로 보낼 수 있다.

/** 밀림 한 건 — 얼마나 밀었고 누가 밀었나 */
export interface ShiftRecord {
  value: number;
  sources: string[];
}

export interface VitalsReport {
  /** 가장 큰 것이 그려진 시각(ms). 아직 아무것도 안 그려졌으면 0 */
  lcp: number;
  /** 그 '가장 큰 것' 이 무엇이었나 */
  lcpElement: string | null;
  /** 밀린 정도의 합계 */
  cls: number;
  shifts: ShiftRecord[];
}

/** 요소를 사람이 알아볼 짧은 이름으로 — 개발자 도구에서 찾을 수 있을 만큼만 */
function describeElement(node: Element | null | undefined): string | null {
  if (!node) {
    return null;
  }

  const alt = node.getAttribute?.('alt');
  if (alt) {
    return `${node.tagName}[alt="${alt}"]`;
  }

  const className = typeof node.className === 'string' ? node.className : '';
  const [firstClass] = className.split(' ').filter(Boolean);

  return firstClass ? `${node.tagName}.${firstClass}` : node.tagName;
}

/**
 * 이 브라우저가 그 지표를 아는지 먼저 묻는다.
 *
 * 모르는 종류로 observe() 를 부르면 던진다. 재려다 앱을 죽이면 안 되므로
 * 아는 것만 관찰하고 나머지는 조용히 넘어간다.
 */
function canObserve(type: string): boolean {
  return PerformanceObserver.supportedEntryTypes?.includes(type) ?? false;
}

/**
 * LCP·CLS 를 관찰하고 값이 바뀔 때마다 알려준다. 관찰을 멈추는 함수를 돌려준다.
 *
 * 두 지표는 성격이 다르다. LCP 는 '마지막에 온 것' 이 답이고(더 큰 것이 나타나면
 * 그쪽으로 바뀐다), CLS 는 '지금까지 밀린 것의 합' 이다.
 */
export function observeVitals(report: (value: VitalsReport) => void): () => void {
  const state: VitalsReport = { lcp: 0, lcpElement: null, cls: 0, shifts: [] };
  const observers: PerformanceObserver[] = [];

  if (canObserve('largest-contentful-paint')) {
    const lcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // 더 큰 것이 뒤늦게 나타나면 답이 그쪽으로 바뀐다. 그래서 마지막 것이 답이다.
        const lcpEntry = entry as PerformanceEntry & { element?: Element | null };
        state.lcp = lcpEntry.startTime;
        state.lcpElement = describeElement(lcpEntry.element);
      }
      report({ ...state, shifts: [...state.shifts] });
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    observers.push(lcpObserver);
  }

  if (canObserve('layout-shift')) {
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
          sources?: { node?: Element | null }[];
        };

        // 방금 누른 뒤에 화면이 바뀌는 것은 사용자가 시킨 일이다.
        // 그것까지 세면 정상 동작이 벌점이 된다.
        if (shift.hadRecentInput) {
          continue;
        }

        state.cls += shift.value;
        state.shifts.push({
          value: shift.value,
          sources: (shift.sources ?? [])
            .map((source) => describeElement(source.node))
            .filter((name): name is string => name !== null),
        });
      }
      report({ ...state, shifts: [...state.shifts] });
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
    observers.push(clsObserver);
  }

  // 관찰자는 새 엔트리가 있을 때만 운다. 밀림을 다 고쳐서 엔트리가 0건이면
  // 아무도 안 울고, 그러면 "다 왔는데 안 밀렸다" 는 사실이 화면에 영영 안 나온다.
  //
  // 게다가 CLS 는 끝까지 확정되지 않는다 — 사용자가 더 스크롤하면 더 밀 수 있다.
  // 그래서 진짜 서비스도 화면을 떠나는 순간에 마지막 값을 보낸다. 여기서도 같게 한다.
  const flush = () => report({ ...state, shifts: [...state.shifts] });
  const flushOnLeave = () => {
    if (document.visibilityState === 'hidden') {
      flush();
    }
  };

  window.addEventListener('load', flush);
  document.addEventListener('visibilitychange', flushOnLeave);

  // 이미 다 불러온 뒤에 켰다면 load 는 다시 안 온다. 그 경우 한 번 바로 보고한다.
  if (document.readyState === 'complete') {
    flush();
  }

  return () => {
    for (const observer of observers) {
      observer.disconnect();
    }
    window.removeEventListener('load', flush);
    document.removeEventListener('visibilitychange', flushOnLeave);
  };
}

/**
 * 피드 사진이 몇 장이나 실제로 도착했나.
 *
 * ⚠️ CLS 가 0 으로 나왔을 때 이것을 같이 안 보면 두 가지를 구별할 수 없다.
 *    사진이 다 왔는데 안 민 것(고친 것)과, 사진이 아예 안 와서 밀 것이 없었던 것(못 잰 것).
 *    두 경우의 숫자가 똑같이 0 이다.
 */
/**
 * 피드 사진이 전부 도착하는 순간에 한 번 알려준다. 그만두는 함수를 돌려준다.
 *
 * 왜 필요한가 — SPA 는 사진이 최초 HTML 에 없다. 데이터를 받아온 뒤에 React 가 붙이므로
 * window 의 load 는 사진이 오기 한참 전에 이미 끝나 있다.
 * 게다가 밀림을 다 고치고 나면 layout-shift 엔트리가 0건이라 관찰자도 안 운다.
 * 그래서 "다 왔는데 안 밀렸다" 를 확인할 순간을 따로 잡아야 한다.
 *
 * img 의 load 는 위로 안 올라온다(버블링 없음). 그래서 내려가는 길에서 잡는다.
 */
export function onFeedImagesSettled(callback: () => void): () => void {
  let done = false;

  const check = () => {
    if (done || !countFeedImages().allLoaded) {
      return;
    }
    done = true;
    document.removeEventListener('load', check, true);
    callback();
  };

  document.addEventListener('load', check, true);
  check();

  return () => {
    done = true;
    document.removeEventListener('load', check, true);
  };
}

export function countFeedImages(): { total: number; loaded: number; allLoaded: boolean } {
  // ⚠️ 고르는 기준을 width·height 로 삼으면 안 된다. 그 두 속성은 밀림을 고칠 때
  //    우리가 붙이는 것이라, 고치기 전에는 한 장도 안 잡혀 0/0 이 나온다.
  //    "재기 전과 재기 후" 를 같은 자로 재려면 고침과 무관한 기준이어야 한다.
  const images = [...document.querySelectorAll('img[alt$="의 게시물"]')] as HTMLImageElement[];
  const loaded = images.filter((image) => image.complete && image.naturalWidth > 0);

  return {
    total: images.length,
    loaded: loaded.length,
    // 한 장도 없으면 '다 왔다' 가 아니라 '잰 것이 없다' 이다
    allLoaded: images.length > 0 && loaded.length === images.length,
  };
}
