import { aiResultLabels, decisionLabels, errorTypeLabels, errorTypes, historyPeriodLabels } from '../inspections/constants';
import type { AiResult, Decision, Device, ErrorType, HistoryPeriod, HistorySearch } from '../inspections/types';

// URL ↔ 이력 조회 조건(계획 §4-1 `/history?period=&device=&ai=&decision=&errorType=&unconfirmed=&page=`).
// 기본값(오늘·최신순·1쪽)은 URL에 쓰지 않는다. 알 수 없는 값은 기본값으로 되돌린다.

export const PAGE_SIZE = 8;

const periods = Object.keys(historyPeriodLabels) as HistoryPeriod[];
const aiValues = Object.keys(aiResultLabels) as AiResult[];
const decisions = Object.keys(decisionLabels) as Decision[];

/** 조회 버튼으로 적용하는 조건. 페이지는 따로 다룬다. */
export interface HistoryFilters {
  period: HistoryPeriod;
  device: string | null;
  ai: AiResult | null;
  decision: Decision | null;
  errorType: ErrorType | null;
  unconfirmed: boolean;
}

export interface HistoryQuery extends HistoryFilters { page: number }

export const defaultFilters: HistoryFilters = { period: 'today', device: null, ai: null, decision: null, errorType: null, unconfirmed: false };

const pick = <T extends string>(values: readonly T[], value: string | null) => (values.includes(value as T) ? (value as T) : null);

/**
 * 서로 맞지 않는 조합을 정리한다.
 * - 미확인만 보기: 아직 약사 판정이 없으므로 약사 판정·오류 유형을 적용하지 않는다.
 * - 오류 유형: 실제 오류 판정에만 있으므로 AI 오검출과 함께 쓰지 않는다.
 */
export function normalizeFilters(filters: HistoryFilters): HistoryFilters {
  if (filters.unconfirmed) return { ...filters, decision: null, errorType: null };
  if (filters.decision === 'false-positive') return { ...filters, errorType: null };
  return filters;
}

export function parseHistoryQuery(params: URLSearchParams): HistoryQuery {
  const page = Number.parseInt(params.get('page') ?? '', 10);
  const filters = normalizeFilters({
    period: pick(periods, params.get('period')) ?? defaultFilters.period,
    device: params.get('device') || null,
    ai: pick(aiValues, params.get('ai')),
    decision: pick(decisions, params.get('decision')),
    errorType: pick(errorTypes, params.get('errorType')),
    unconfirmed: params.get('unconfirmed') === '1',
  });
  return { ...filters, page: Number.isFinite(page) && page > 0 ? page : 1 };
}

export function toSearchParams(query: HistoryQuery) {
  const filters = normalizeFilters(query);
  const params = new URLSearchParams();
  if (filters.period !== defaultFilters.period) params.set('period', filters.period);
  if (filters.device) params.set('device', filters.device);
  if (filters.ai) params.set('ai', filters.ai);
  if (filters.decision) params.set('decision', filters.decision);
  if (filters.errorType) params.set('errorType', filters.errorType);
  if (filters.unconfirmed) params.set('unconfirmed', '1');
  if (query.page > 1) params.set('page', String(query.page));
  return params;
}

/** 같은 조건·페이지인지 비교하는 키(정규화된 URL 문자열). */
export function queryKey(query: HistoryQuery) {
  return toSearchParams(query).toString();
}

export function sameFilters(a: HistoryFilters, b: HistoryFilters) {
  return queryKey({ ...a, page: 1 }) === queryKey({ ...b, page: 1 });
}

export function isDefaultFilters(filters: HistoryFilters) {
  return sameFilters(filters, defaultFilters);
}

export function toHistorySearch(query: HistoryQuery): HistorySearch {
  const filters = normalizeFilters(query);
  return {
    period: filters.period,
    deviceId: filters.device,
    aiResult: filters.ai,
    decision: filters.decision,
    errorType: filters.errorType,
    unconfirmedOnly: filters.unconfirmed,
    page: query.page,
    pageSize: PAGE_SIZE,
  };
}

/** 결과 위에 보여 줄 적용 조건 요약. 기간과 최신순은 항상 넣는다. */
export function describeFilters(filters: HistoryFilters, devices: Device[]) {
  const parts: string[] = [historyPeriodLabels[filters.period]];
  if (filters.device) parts.push(devices.find(device => device.id === filters.device)?.name ?? '알 수 없는 장비');
  if (filters.ai) parts.push(`AI ${aiResultLabels[filters.ai]}`);
  if (filters.decision) parts.push(decisionLabels[filters.decision]);
  if (filters.errorType) parts.push(errorTypeLabels[filters.errorType]);
  if (filters.unconfirmed) parts.push('미확인만');
  parts.push('최신순');
  return parts.join(' · ');
}
