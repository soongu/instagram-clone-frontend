// C-1 Step 7 — end 가 언제 갈리는지 재보는 판 (내부 검증용)
//
// 우리 앱에는 자식을 거느린 주소가 아직 없어서 end 가 아무 차이를 안 만든다.
// 그 사실 자체를 재려면 자식이 있는 주소가 필요하므로 여기에만 임시로 하나 만든다.
// (src/routes 에는 안 들어간다 — 우리 앱의 주소가 아니다.)
import { NavLink, Outlet } from 'react-router';

function linkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'ON' : 'off';
}

export function EndProbeNav() {
  return (
    <nav aria-label="재보는 메뉴">
      <NavLink to="/" className={linkClass}>
        root-noend
      </NavLink>
      <NavLink to="/" end className={linkClass}>
        root-end
      </NavLink>
      <NavLink to="/signup" className={linkClass}>
        signup-noend
      </NavLink>
      <NavLink to="/signup" end className={linkClass}>
        signup-end
      </NavLink>
      <Outlet />
    </nav>
  );
}

const Leaf = () => <p>leaf</p>;

// /signup 아래에 자식을 하나 달아 둔 판
export const endProbeRoutes = [
  {
    path: '/',
    Component: EndProbeNav,
    children: [
      { index: true, Component: Leaf },
      {
        path: 'signup',
        Component: Outlet,
        children: [
          { index: true, Component: Leaf },
          { path: 'done', Component: Leaf },
        ],
      },
    ],
  },
];
