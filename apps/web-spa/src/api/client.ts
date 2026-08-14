// apps/web-spa/src/api/client.ts
import axios, { AxiosError } from 'axios';

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

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
});

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
  (error: unknown) => {
    if (error instanceof AxiosError) {
      // 응답이 아예 없으면 서버까지 못 간 것이다.
      // 이때 Axios 가 주는 말은 'Network Error' — 영어라서 화면에 그대로 못 쓴다.
      if (error.response === undefined) {
        throw new ApiError(CONNECTION_FAILED, null);
      }

      // 4xx·5xx 에도 서버는 사유를 봉투에 담아 보낸다. 그 말을 그대로 쓴다.
      const envelope = error.response.data as ApiEnvelope<unknown> | undefined;

      throw new ApiError(envelope?.message ?? CONNECTION_FAILED, error.response.status);
    }

    throw new ApiError(CONNECTION_FAILED, null);
  },
);
