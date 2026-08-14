// C-3 이후 밝기를 읽는 컴포넌트를 홀로 그려보는 도우미 (내부 검증용)
//
// C-3 Step 2 에서 밝기 상태가 ThemeToggle 안에서 ThemeProvider 로 옮겨갔다.
// 홀로 그리면 값을 넣어주는 쪽이 없어 아무 일도 안 일어난다 —
// c1-router-harness 의 withRouter 와 같은 성격으로, 문맥만 씌워준다.
// 화면에는 아무것도 안 더한다.
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { AppProviders } from '../src/AppProviders';

export function withTheme(ui: React.ReactNode) {
  return <ThemeProvider>{ui}</ThemeProvider>;
}

// C-3 Step 5 에서 밝기가 Layout 밖(AppProviders)으로 올라갔다.
// 앱을 통째로 그리는 판들은 이제 실제 main.tsx 와 같은 모양으로 감싸야 한다.
export function withApp(ui: React.ReactNode) {
  return <AppProviders>{ui}</AppProviders>;
}
