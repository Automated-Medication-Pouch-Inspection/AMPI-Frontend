import type { AiResult, Detection, Device, Inspection, Judgment, MaskingStatus } from '../features/inspections/types';

// 모든 값은 개발용 가상 데이터입니다. 실제 약품·처방·환자 정보가 아닙니다.
// 이미지도 실제 촬영본이 아니라 코드로 그린 시연용 그림입니다.

export const demoDevices: Device[] = [
  { id: 'device-1', name: '1호기', mode: '일반 조제', pattern: '3 → 2 → 3', sessionNo: '#0028', connection: 'online', maskingStatus: 'ok', offlineSince: null },
  { id: 'device-2', name: '2호기', mode: '장포 조제', pattern: '2 → 2 → 2', sessionNo: '#0019', connection: 'online', maskingStatus: 'ok', offlineSince: null },
];

function tabletPositions(count: number): Detection[] {
  const size = 0.16;
  const gap = count > 1 ? (0.8 - size * count) / (count - 1) : 0;
  return Array.from({ length: count }, (_, index) => ({ x: count > 1 ? 0.1 + index * (size + gap) : 0.42, y: 0.38, width: size, height: size * 1.6 }));
}

function demoImage(count: number, label: string) {
  const tablets = tabletPositions(count)
    .map(box => `<ellipse cx="${(box.x + box.width / 2) * 640}" cy="${(box.y + box.height / 2) * 400}" rx="44" ry="44" fill="#fdfdf8" stroke="#b9b39a" stroke-width="3"/>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="#dfe8ef"/><rect x="30" y="40" width="580" height="320" rx="18" fill="#eef4f8" stroke="#9fb3c4" stroke-width="3" stroke-dasharray="10 8"/>${tablets}<text x="320" y="96" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#5b6b7b">시연 이미지 · ${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

interface Seed {
  id: string;
  device: 'device-1' | 'device-2';
  seq: number;
  time: string;
  expected: number;
  detected: number | null;
  ai: AiResult;
  masking?: MaskingStatus;
  judgment?: Judgment;
}

const seeds: Seed[] = [
  // 1호기: 최근 약포지 #0137~#0144, 이전 미확인 판독 불가 #0108
  { id: 'DEMO-004', device: 'device-1', seq: 144, time: '14:32:12', expected: 2, detected: 2, ai: 'match' },
  { id: 'DEMO-005', device: 'device-1', seq: 143, time: '14:32:07', expected: 3, detected: 3, ai: 'match' },
  { id: 'DEMO-001', device: 'device-1', seq: 142, time: '14:32:02', expected: 3, detected: 2, ai: 'suspected' },
  { id: 'DEMO-006', device: 'device-1', seq: 141, time: '14:31:57', expected: 2, detected: 2, ai: 'match', masking: 'failed' },
  { id: 'DEMO-007', device: 'device-1', seq: 140, time: '14:31:52', expected: 3, detected: 3, ai: 'match' },
  {
    id: 'DEMO-008', device: 'device-1', seq: 139, time: '14:31:47', expected: 2, detected: 3, ai: 'suspected',
    judgment: { decision: 'false-positive', memo: '그림자를 정제로 인식', judgedBy: '이약사', judgedAt: '2026-11-25T14:31:58+09:00' },
  },
  { id: 'DEMO-009', device: 'device-1', seq: 138, time: '14:31:42', expected: 3, detected: 3, ai: 'match' },
  { id: 'DEMO-010', device: 'device-1', seq: 137, time: '14:31:37', expected: 2, detected: 2, ai: 'match' },
  { id: 'DEMO-003', device: 'device-1', seq: 108, time: '14:20:30', expected: 2, detected: null, ai: 'unreadable', masking: 'unknown' },
  // 2호기: #0121~#0126
  { id: 'DEMO-011', device: 'device-2', seq: 127, time: '14:30:24', expected: 2, detected: 2, ai: 'match' },
  { id: 'DEMO-002', device: 'device-2', seq: 126, time: '14:30:12', expected: 2, detected: 3, ai: 'suspected' },
  { id: 'DEMO-012', device: 'device-2', seq: 125, time: '14:30:00', expected: 2, detected: 2, ai: 'match' },
  { id: 'DEMO-013', device: 'device-2', seq: 124, time: '14:29:48', expected: 2, detected: 2, ai: 'match' },
  { id: 'DEMO-014', device: 'device-2', seq: 123, time: '14:29:36', expected: 2, detected: 2, ai: 'match' },
  { id: 'DEMO-015', device: 'device-2', seq: 122, time: '14:29:24', expected: 2, detected: 2, ai: 'match' },
];

export const demoInspections: Inspection[] = seeds.map(seed => {
  const device = demoDevices.find(item => item.id === seed.device)!;
  const sequenceNo = `#${String(seed.seq).padStart(4, '0')}`;
  const drawn = seed.detected ?? seed.expected;
  const masking = seed.masking ?? 'ok';
  return {
    id: seed.id,
    deviceId: device.id,
    deviceName: device.name,
    sequenceNo,
    capturedAt: `2026-11-25T${seed.time}+09:00`,
    expectedCount: seed.expected,
    detectedCount: seed.detected,
    aiResult: seed.ai,
    detections: seed.detected === null ? [] : tabletPositions(drawn),
    // 마스킹이 정상이 아니면 서버는 URL을 주지 않아야 한다(계획 §3-3-5). 목 데이터도 같은 계약을 따른다.
    image: { url: masking === 'ok' ? demoImage(drawn, `${device.name} ${sequenceNo}`) : null, maskingStatus: masking },
    judgment: seed.judgment ?? null,
    version: seed.judgment ? 2 : 1,
  };
});
