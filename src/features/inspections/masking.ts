import type { Device, Inspection } from './types';

/**
 * 이미지 표시 조건(계획 §3-3-2): 이미지 마스킹 = 정상 그리고 장비 마스킹 = 정상.
 * 알 수 없음은 차단한다(fail closed).
 */
export function canShowImage(item: Inspection, device: Device | undefined) {
  return item.image.maskingStatus === 'ok' && device?.maskingStatus === 'ok' && item.image.url !== null;
}

export function isMaskingBlocked(item: Inspection, device: Device | undefined) {
  return item.image.maskingStatus !== 'ok' || device?.maskingStatus !== 'ok';
}
