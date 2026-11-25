import { saveJudgment as saveMockJudgment } from '../../mocks/mockStore';
import type { InspectionId, JudgmentInput, SaveResult } from './types';

// 실제 API 연동 지점. 1단계에서는 개발용 메모리 저장소를 호출합니다.
// 서버 연동 시 request('/inspections/:id/judgment', { method: 'POST' })로 바꾸고 ApiError를 그대로 던집니다.

/** 시연용 판정자. 인증(S-01) 전까지 고정값을 쓴다. */
export const demoPharmacist = '김약사';

export function saveJudgment(id: InspectionId, input: JudgmentInput): Promise<SaveResult> {
  return saveMockJudgment(id, input, demoPharmacist);
}
