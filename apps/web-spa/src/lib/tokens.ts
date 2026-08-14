// apps/web-spa/src/lib/tokens.ts

// 토큰을 어디에 두는지는 한 곳에서만 안다.
// 나중에 저장 위치를 바꿀 일이 생겨도 이 파일만 고치면 된다.
const ACCESS_KEY = 'instagram.accessToken';
const REFRESH_KEY = 'instagram.refreshToken';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const tokenStore = {
  access(): string | null {
    return window.localStorage.getItem(ACCESS_KEY);
  },

  refresh(): string | null {
    return window.localStorage.getItem(REFRESH_KEY);
  },

  save({ accessToken, refreshToken }: TokenPair): void {
    window.localStorage.setItem(ACCESS_KEY, accessToken);
    window.localStorage.setItem(REFRESH_KEY, refreshToken);
  },

  saveAccess(accessToken: string): void {
    window.localStorage.setItem(ACCESS_KEY, accessToken);
  },

  clear(): void {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};
