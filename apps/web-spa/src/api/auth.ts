// apps/web-spa/src/api/auth.ts
import { api } from './client';
import { tokenStore, type TokenPair } from '../lib/tokens';

interface LoginResponse extends TokenPair {
  user: { id: number; username: string; profileImageUrl: string };
}

// 로그인 화면은 아직 없다(그건 G-1 의 몫). 여기서는 토큰을 받아 두는 일만 한다.
export async function login(username: string): Promise<LoginResponse['user']> {
  const response = await api.post<LoginResponse>('/auth/login', { username });

  tokenStore.save({
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  });

  return response.data.user;
}

export function logout(): void {
  tokenStore.clear();
}
