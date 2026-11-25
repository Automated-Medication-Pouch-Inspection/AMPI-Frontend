import { demoInspections } from '../../mocks/inspections';

// 실제 API 연동 지점. 지금은 가상 데이터만 반환합니다.
export function getInspections() { return demoInspections; }
export function getInspection(id: string) { return demoInspections.find(item => item.id === id); }
