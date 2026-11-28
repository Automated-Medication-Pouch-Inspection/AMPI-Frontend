import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, type ApiErrorKind } from '../../lib/api/client';
import { fetchHistory } from '../inspections/api';
import type { HistoryPage } from '../inspections/types';
import { parseHistoryQuery, queryKey, toHistorySearch, type HistoryQuery } from './historyQuery';

// 이력 조회 상태(계획 §3-2 로딩·빈 결과·조회 실패, §4-3 S-05 버튼 표).
// - 조회·페이지 이동·조건 초기화: 먼저 요청하고, 성공하면 URL을 바꾼다. 실패하면 URL·결과·입력을 그대로 둔다.
// - 새로고침·뒤로 가기·상세에서 복귀: URL 조건으로 다시 요청한다.
// - 요청 중에는 새 조회 요청을 무시한다(뒤로 가기처럼 URL이 바뀐 경우만 새 요청이 앞선 요청을 대신한다).

interface Request { query: HistoryQuery; navigate: boolean }

export interface HistoryResultState {
  data: HistoryPage | null;
  /** data가 답한 조건의 키(queryKey). URL 키와 다르면 지금 URL의 결과가 아니다. */
  dataKey: string | null;
  /** 성공한 조회를 URL에 반영하는 중이면 그 키. URL 갱신은 한 박자 늦게 그려지므로 그 사이에도 결과를 유지한다. */
  committingKey: string | null;
  loading: boolean;
  error: { kind: ApiErrorKind; request: Request } | null;
}

export function useHistoryResults(urlKey: string, commit: (query: HistoryQuery) => void) {
  const [state, setState] = useState<HistoryResultState>({ data: null, dataKey: null, committingKey: null, loading: true, error: null });
  const latestId = useRef(0);
  const busy = useRef(false);
  const dataKey = useRef<string | null>(null);
  const commitRef = useRef(commit);
  useEffect(() => { commitRef.current = commit; }, [commit]);

  const load = useCallback(async (request: Request) => {
    const id = ++latestId.current;
    busy.current = true;
    setState(current => ({ ...current, loading: true, error: null }));
    try {
      const data = await fetchHistory(toHistorySearch(request.query));
      if (id !== latestId.current) return;
      busy.current = false;
      dataKey.current = queryKey(request.query);
      setState({ data, dataKey: dataKey.current, committingKey: request.navigate ? dataKey.current : null, loading: false, error: null });
      if (request.navigate) commitRef.current(request.query);
    } catch (cause) {
      if (id !== latestId.current) return;
      busy.current = false;
      setState(current => ({ ...current, loading: false, error: { kind: cause instanceof ApiError ? cause.kind : 'server', request } }));
    }
  }, []);

  // URL이 바뀌었는데 그 조건의 결과가 없으면 불러온다(첫 진입·새로고침·뒤로 가기·상세에서 복귀).
  useEffect(() => {
    if (dataKey.current === urlKey) {
      setState(current => (current.committingKey ? { ...current, committingKey: null } : current));
      return;
    }
    void load({ query: parseHistoryQuery(new URLSearchParams(urlKey)), navigate: false });
  }, [urlKey, load]);

  // 화면을 떠나면 늦게 온 응답을 버린다.
  useEffect(() => () => { latestId.current += 1; }, []);

  /** 조회·페이지 이동·조건 초기화. 요청 중이면 무시한다. */
  const run = useCallback((query: HistoryQuery) => {
    if (busy.current) return;
    // 지금 URL과 같은 조건이면 URL은 그대로 두고 결과만 새로 받는다.
    void load({ query, navigate: queryKey(query) !== urlKey });
  }, [load, urlKey]);

  const retry = useCallback(() => {
    if (busy.current || !state.error) return;
    void load(state.error.request);
  }, [load, state.error]);

  // 지금 URL 조건에 대한 결과만 보여 준다(뒤로 가기 직후 등에는 이전 조건의 결과를 섞지 않는다).
  const current = state.data && (state.dataKey === urlKey || state.dataKey === state.committingKey) ? state.data : null;

  return { result: current, loading: state.loading, error: state.error, run, retry };
}

export function historyErrorMessage(kind: ApiErrorKind) {
  if (kind === 'network') return '네트워크 연결을 확인한 뒤 다시 시도하세요.';
  if (kind === 'unauthorized' || kind === 'forbidden') return '조회 권한이 없습니다. 다시 로그인하거나 관리자에게 문의하세요.';
  return '잠시 후 다시 시도하세요. 계속되면 관리자에게 알려 주세요.';
}
