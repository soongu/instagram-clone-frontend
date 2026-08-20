// apps/web-next/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 실행에 진짜 필요한 것만 골라 한 덩어리로 내보낸다.
  output: 'standalone',
  typedRoutes: true,
  // 굳힐 것과 흘려보낼 것을 우리가 직접 고르겠다고 선언하는 스위치.
  cacheComponents: true,
  images: {
    // 여기 적힌 주소에서 온 사진만 다시 만들어 준다. 나머지는 400 으로 거절한다.
    remotePatterns: [new URL('https://picsum.photos/seed/**')],
  },
  // 모든 주소에 같은 헤더를 붙인다. 여기서는 요청마다 다른 값을 만들 수 없다.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: "default-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
