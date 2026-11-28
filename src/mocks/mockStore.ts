import { ApiError } from '../lib/api/client';
import type { Device, HistoryPage, HistorySearch, Inspection, InspectionId, JudgmentInput, SaveResult } from '../features/inspections/types';
import { DEMO_TODAY, demoArchive, demoDevices, demoInspections, shiftDate } from './inspections';

// 개발 전용 메모리 저장소. 새로고침하면 초기화된다. 서버 연동 시 features/inspections/api.ts가 이 파일 대신 실제 요청을 쓴다.

export interface DevOptions {
  /** 저장 응답 지연(ms) */
  saveDelayMs: number;
  /** 저장을 서버 오류로 실패시킨다 */
  failSave: boolean;
  /** 2호기를 오프라인으로 만든다(브라우저 연결과 별개) */
  device2Offline: boolean;
  /** 2호기 장비 단위 마스킹 실패 */
  device2MaskingFailed: boolean;
  /** 이력 조회 응답 지연(ms) */
  historyDelayMs: number;
  /** 이력 조회를 서버 오류로 실패시킨다 */
  failHistory: boolean;
}

export interface MockState {
  /** 오늘(기준일) 데이터. 실시간 검수·판정이 쓴다. */
  inspections: Inspection[];
  /** 지난 기록(읽기 전용). 이력 조회·상세에서만 쓴다. */
  archive: Inspection[];
  devices: Device[];
  dev: DevOptions;
  /** 서버에 실제로 도달한 저장 요청 수(중복 제출 검증용) */
  saveRequestCount: number;
}

const DEVICE_2 = 'device-2';
const OFFLINE_SINCE = '2026-11-25T14:30:30+09:00';

const baseDevices = demoDevices.map(device => ({ ...device }));
let dev: DevOptions = { saveDelayMs: 800, failSave: false, device2Offline: false, device2MaskingFailed: false, historyDelayMs: 600, failHistory: false };
let inspections: Inspection[] = demoInspections.map(item => ({ ...item }));
let saveRequestCount = 0;
const handledKeys = new Map<string, SaveResult>();

function buildDevices(): Device[] {
  return baseDevices.map(device => device.id !== DEVICE_2 ? device : {
    ...device,
    connection: dev.device2Offline ? 'offline' : 'online',
    offlineSince: dev.device2Offline ? OFFLINE_SINCE : null,
    maskingStatus: dev.device2MaskingFailed ? 'failed' : 'ok',
  });
}

let state: MockState = { inspections, archive: demoArchive, devices: buildDevices(), dev, saveRequestCount };
const listeners = new Set<() => void>();

function emit() {
  state = { inspections, archive: demoArchive, devices: buildDevices(), dev, saveRequestCount };
  listeners.forEach(listener => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getSnapshot() { return state; }

export function setDevOptions(patch: Partial<DevOptions>) {
  dev = { ...dev, ...patch };
  emit();
}

export function countUnconfirmed(items: Inspection[]) {
  return items.filter(item => item.aiResult !== 'match' && !item.judgment).length;
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function saveJudgment(id: InspectionId, input: JudgmentInput, judgedBy: string): Promise<SaveResult> {
  // 브라우저가 오프라인이면 요청이 서버에 닿지 않는다.
  if (!navigator.onLine) throw new ApiError('network', null);
  const repeated = handledKeys.get(input.idempotencyKey);
  if (repeated) return repeated;
  saveRequestCount += 1;
  emit();
  await wait(dev.saveDelayMs);
  if (!navigator.onLine) throw new ApiError('network', null);
  if (dev.failSave) throw new ApiError('server', 500, 'demo-request');
  const current = inspections.find(item => item.id === id);
  if (!current) throw new ApiError('not-found', 404);
  if (current.judgment || current.version !== input.version) throw new ApiError('conflict', 409);
  if (input.decision === 'error' && !input.errorType) throw new ApiError('validation', 422);
  const saved: Inspection = {
    ...current,
    version: current.version + 1,
    judgment: {
      decision: input.decision,
      memo: input.memo,
      ...(input.decision === 'error' ? { errorType: input.errorType, actionDone: input.actionDone ?? false } : {}),
      judgedBy,
      judgedAt: new Date().toISOString(),
    },
  };
  inspections = inspections.map(item => item.id === id ? saved : item);
  const result = { inspection: saved, unconfirmedCount: countUnconfirmed(inspections) };
  handledKeys.set(input.idempotencyKey, result);
  emit();
  return result;
}

const periodDays: Record<HistorySearch['period'], { from: number; to: number }> = {
  today: { from: 0, to: 0 },
  yesterday: { from: 1, to: 1 },
  '7d': { from: 6, to: 0 },
  '30d': { from: 29, to: 0 },
};

/** 이력 조회(서버 역할). 필터·기간·최신순 정렬·페이지 나눔을 여기서 한다. */
export async function queryHistory(search: HistorySearch): Promise<HistoryPage> {
  if (!navigator.onLine) throw new ApiError('network', null);
  await wait(dev.historyDelayMs);
  if (!navigator.onLine) throw new ApiError('network', null);
  if (dev.failHistory) throw new ApiError('server', 500, 'demo-request');
  const days = periodDays[search.period];
  const range = { from: shiftDate(DEMO_TODAY, days.from), to: shiftDate(DEMO_TODAY, days.to) };
  const rows = [...demoArchive, ...inspections]
    .filter(item => {
      const date = item.capturedAt.slice(0, 10);
      return date >= range.from && date <= range.to;
    })
    .filter(item => !search.deviceId || item.deviceId === search.deviceId)
    .filter(item => !search.aiResult || item.aiResult === search.aiResult)
    .filter(item => !search.decision || item.judgment?.decision === search.decision)
    .filter(item => !search.errorType || (item.judgment?.decision === 'error' && item.judgment.errorType === search.errorType))
    .filter(item => !search.unconfirmedOnly || (item.aiResult !== 'match' && !item.judgment))
    .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
  const lastPage = Math.max(1, Math.ceil(rows.length / search.pageSize));
  const page = Math.min(Math.max(1, search.page), lastPage);
  const start = (page - 1) * search.pageSize;
  return { items: rows.slice(start, start + search.pageSize), total: rows.length, page, pageSize: search.pageSize, range };
}
