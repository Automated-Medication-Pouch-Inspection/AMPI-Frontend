import { ApiError } from '../lib/api/client';
import type { Device, Inspection, InspectionId, JudgmentInput, SaveResult } from '../features/inspections/types';
import { demoDevices, demoInspections } from './inspections';

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
}

export interface MockState {
  inspections: Inspection[];
  devices: Device[];
  dev: DevOptions;
  /** 서버에 실제로 도달한 저장 요청 수(중복 제출 검증용) */
  saveRequestCount: number;
}

const DEVICE_2 = 'device-2';
const OFFLINE_SINCE = '2026-11-25T14:30:30+09:00';

const baseDevices = demoDevices.map(device => ({ ...device }));
let dev: DevOptions = { saveDelayMs: 800, failSave: false, device2Offline: false, device2MaskingFailed: false };
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

let state: MockState = { inspections, devices: buildDevices(), dev, saveRequestCount };
const listeners = new Set<() => void>();

function emit() {
  state = { inspections, devices: buildDevices(), dev, saveRequestCount };
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
