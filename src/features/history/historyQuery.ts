import type { AiResult, Inspection } from '../inspections/types';

// URL ↔ 이력 조회 조건. 1단계는 장비·AI 결과·미확인만 보기·페이지만 다룬다(전체 필터는 2단계).

export const PAGE_SIZE = 8;
const aiValues: AiResult[] = ['match', 'suspected', 'unreadable'];

export interface HistoryQuery {
  device: string | null;
  ai: AiResult | null;
  unconfirmed: boolean;
  page: number;
}

export function parseHistoryQuery(params: URLSearchParams): HistoryQuery {
  const ai = params.get('ai');
  const page = Number.parseInt(params.get('page') ?? '', 10);
  return {
    device: params.get('device') || null,
    ai: aiValues.includes(ai as AiResult) ? (ai as AiResult) : null,
    unconfirmed: params.get('unconfirmed') === '1',
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function toSearchParams(query: HistoryQuery) {
  const params = new URLSearchParams();
  if (query.device) params.set('device', query.device);
  if (query.ai) params.set('ai', query.ai);
  if (query.unconfirmed) params.set('unconfirmed', '1');
  if (query.page > 1) params.set('page', String(query.page));
  return params;
}

export function isDefaultQuery(query: HistoryQuery) {
  return !query.device && !query.ai && !query.unconfirmed && query.page === 1;
}

export function applyHistoryQuery(items: Inspection[], query: HistoryQuery) {
  return items
    .filter(item => !query.device || item.deviceId === query.device)
    .filter(item => !query.ai || item.aiResult === query.ai)
    .filter(item => !query.unconfirmed || (item.aiResult !== 'match' && !item.judgment))
    .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
}
