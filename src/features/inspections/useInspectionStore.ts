import { useSyncExternalStore } from 'react';
import { getSnapshot, subscribe } from '../../mocks/mockStore';
import type { Device, Inspection } from './types';

// 목 저장소 구독. 저장이 끝나면 저장소가 알려 미확인 목록·집계·상단 배지가 같은 값으로 다시 그려진다.

export function useInspectionStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useInspections() { return useInspectionStore().inspections; }
export function useDevices() { return useInspectionStore().devices; }

export function isUnconfirmed(item: Inspection) {
  return item.aiResult !== 'match' && !item.judgment;
}

export function selectUnconfirmed(items: Inspection[]) {
  return items.filter(isUnconfirmed).sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
}

/** 상단 배지·S-03 집계·미확인 목록이 모두 이 기준을 쓴다. */
export function useUnconfirmedCount() { return useInspections().filter(isUnconfirmed).length; }

/** 장비 기준 촬영 순서(오래된 것 → 최신). */
export function selectDeviceTimeline(items: Inspection[], deviceId: string) {
  return items.filter(item => item.deviceId === deviceId).sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
}

export function findDevice(devices: Device[], deviceId: string) {
  return devices.find(device => device.id === deviceId);
}
