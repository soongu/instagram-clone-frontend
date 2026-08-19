// apps/web-next/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  // 굳힐 것과 흘려보낼 것을 우리가 직접 고르겠다고 선언하는 스위치.
  cacheComponents: true,
  images: {
    // 여기 적힌 주소에서 온 사진만 다시 만들어 준다. 나머지는 400 으로 거절한다.
    remotePatterns: [new URL('https://picsum.photos/seed/**')],
  },
};

export default nextConfig;
