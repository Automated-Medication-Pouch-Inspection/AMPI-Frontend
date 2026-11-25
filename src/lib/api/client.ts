// 실제 서버를 연결할 때 사용합니다. 시연 데이터 조회는 네트워크를 사용하지 않습니다.
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseUrl}/${path.replace(/^\//, '')}`, { ...options, headers: { Accept: 'application/json', ...options.headers } });
  if (!response.ok) throw new Error(`요청 실패 (${response.status})`);
  return response.json() as Promise<T>;
}
