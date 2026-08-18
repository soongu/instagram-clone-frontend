import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  // 굳힐 것과 흘려보낼 것을 우리가 직접 고르겠다고 선언하는 스위치.
  cacheComponents: true,
};

export default nextConfig;
