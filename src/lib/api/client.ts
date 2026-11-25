// 실제 서버를 연결할 때 사용합니다. 1단계 시연 데이터는 네트워크를 사용하지 않습니다.
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

/** 화면이 원인별 문구를 고를 수 있도록 오류를 구분한다(계획 §4-3 저장 실패). */
export type ApiErrorKind = 'network' | 'unauthorized' | 'forbidden' | 'not-found' | 'conflict' | 'validation' | 'server';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly requestId?: string;

  constructor(kind: ApiErrorKind, status: number | null, requestId?: string) {
    super(`api-error:${kind}`);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.requestId = requestId;
  }
}

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not-found';
  if (status === 409) return 'conflict';
  if (status === 422) return 'validation';
  return 'server';
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/${path.replace(/^\//, '')}`, { ...options, headers: { Accept: 'application/json', ...options.headers } });
  } catch {
    throw new ApiError('network', null);
  }
  if (!response.ok) throw new ApiError(kindFromStatus(response.status), response.status, response.headers.get('x-request-id') ?? undefined);
  return response.json() as Promise<T>;
}
