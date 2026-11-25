import type { Inspection } from '../features/inspections/types';

// 모든 값은 개발용 가상 데이터입니다. 실제 약품·처방 정보가 아닙니다.
export const demoInspections: Inspection[] = [
  { id: 'DEMO-001', deviceName: '시연 장비 A', createdAt: '2026-11-02T09:00:00+09:00', status: 'needs-review', expectedMedication: '시연 약품 A', expectedQuantity: 2, aiSummary: '연동 전 — 분석 결과 없음' },
  { id: 'DEMO-002', deviceName: '시연 장비 B', createdAt: '2026-11-02T09:05:00+09:00', status: 'pending', expectedMedication: '시연 약품 B', expectedQuantity: 1, aiSummary: '연동 전 — 분석 결과 없음' },
];
