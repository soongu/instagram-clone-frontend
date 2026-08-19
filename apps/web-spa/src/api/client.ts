// apps/web-spa/src/api/client.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from '../lib/tokens';

// 주소를 한 곳에만 적는다. 화면은 '/posts' 처럼 뒷부분만 안다.
export const API_BASE_URL = 'http://localhost:8090/api';

/** 백엔드가 씌워 보내는 봉투 */
interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  message: string | null;
}

/** 서버가 "안 됐다" 고 말했을 때 던지는 것 */
export class ApiError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const CONNECTION_FAILED = '서버에 연결할 수 없어요';
const LOGIN_AGAIN = '다시 로그인해주세요';

// 한 번 다시 보낸 요청에 표시를 남긴다. 안 그러면 401 이 영원히 돌 수 있다.
interface RetriableConfig extends InternalAxiosRequestConfig {
  retried?: boolean;
}

// 토큰을 얻으러 가는 요청. 여기서 온 401 은 "만료" 가 아니라
// "아이디나 비밀번호가 틀렸다" 는 뜻이라 갱신할 것이 없다.
const AUTH_FREE_PATHS = ['/auth/login'];

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
});

// 보내는 쪽 — 토큰이 있으면 모든 요청에 붙는다.
// 화면 어디에도 Authorization 을 적는 곳이 없다.
api.interceptors.request.use((config) => {
  const accessToken = tokenStore.access();

  if (accessToken !== null) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// 갱신은 한 번에 하나만 돈다. 동시에 401 을 받은 요청들이 같은 약속을 기다린다.
let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStore.refresh();

  if (refreshToken === null) {
    throw new ApiError(LOGIN_AGAIN, 401);
  }

  // 갱신 요청은 인터셉터가 없는 맨 axios 로 보낸다.
  // api 로 보내면 이 응답의 401 이 다시 여기로 돌아온다.
  const response = await axios.post<ApiEnvelope<{ accessToken: string }>>(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
  );

  const next = response.data.data?.accessToken;

  if (next === undefined) {
    throw new ApiError(LOGIN_AGAIN, 401);
  }

  tokenStore.saveAccess(next);

  return next;
}

function startRefresh(): Promise<string> {
  refreshing ??= refreshAccessToken().finally(() => {
    refreshing = null;
  });

  return refreshing;
}

api.interceptors.response.use(
  (response) => {
    const envelope = response.data as ApiEnvelope<unknown>;

    // 200 으로 오면서 봉투만 실패인 경우도 있다. 그것도 실패로 만든다.
    if (envelope.success === false) {
      throw new ApiError(envelope.message ?? CONNECTION_FAILED, response.status);
    }

    // 여기서 봉투를 벗긴다. 이 뒤로는 아무도 .data.data 를 안 쓴다.
    response.data = envelope.data;

    return response;
  },
  async (error: unknown) => {
    if (!(error instanceof AxiosError)) {
      throw new ApiError(CONNECTION_FAILED, null);
    }

    // 응답이 아예 없으면 서버까지 못 간 것이다.
    // 이때 Axios 가 주는 말은 'Network Error' — 영어라서 화면에 그대로 못 쓴다.
    if (error.response === undefined) {
      throw new ApiError(CONNECTION_FAILED, null);
    }

    const config = error.config as RetriableConfig | undefined;

    // 액세스 토큰이 만료된 것뿐이라면, 갱신하고 그 요청을 다시 보낸다.
    // 화면은 실패한 줄도 모른다.
    const goesToAuthFreePath = AUTH_FREE_PATHS.includes(config?.url ?? '');

    if (
      error.response.status === 401 &&
      config !== undefined &&
      !goesToAuthFreePath &&
      config.retried !== true
    ) {
      config.retried = true;

      try {
        await startRefresh();
      } catch {
        tokenStore.clear();
        throw new ApiError(LOGIN_AGAIN, 401);
      }

      return api.request(config);
    }

    // 4xx·5xx 에도 서버는 사유를 봉투에 담아 보낸다. 그 말을 그대로 쓴다.
    const envelope = error.response.data as ApiEnvelope<unknown> | undefined;

    throw new ApiError(envelope?.message ?? CONNECTION_FAILED, error.response.status);
  },
);
