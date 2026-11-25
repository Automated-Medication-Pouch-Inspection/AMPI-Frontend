import type { ApiErrorKind } from '../../lib/api/client';
import type { Decision, ErrorType, Inspection, JudgmentInput } from '../inspections/types';

// S-04 판정 폼의 활성·검증 규칙(순수 함수). 계획 §4-3, D-002.

export interface FormValues {
  decision?: Decision;
  errorType?: ErrorType;
  memo: string;
  actionDone: boolean;
}

export type FieldName = 'decision' | 'errorType';
export interface FieldError { field: FieldName; message: string }

export const emptyValues: FormValues = { memo: '', actionDone: false };

/** 오류 유형·조치 완료는 실제 오류를 골랐을 때만 활성. */
export function isErrorDetailEnabled(values: FormValues) {
  return values.decision === 'error';
}

/** 판정 대상: AI가 이상 가능성·판독 불가로 본 건 중 아직 판정이 없는 건. 개수 일치 건은 판정하지 않는다(D-005 미구현). */
export function canJudge(item: Inspection) {
  return item.aiResult !== 'match' && !item.judgment;
}

/** 오류 유형 필수는 계획 §5-2 #8 제안을 따른다(팀 확정 전). */
export function validate(values: FormValues): FieldError[] {
  if (!values.decision) return [{ field: 'decision', message: '실제 오류 또는 AI 오검출을 선택하세요.' }];
  if (values.decision === 'error' && !values.errorType) return [{ field: 'errorType', message: '실제 오류의 오류 유형을 선택하세요.' }];
  return [];
}

/** 전송 본문. AI 오검출이면 오류 유형·조치 완료를 넣지 않는다(완료 조건 6). 폼 값은 그대로 남겨 다시 실제 오류를 고르면 복원한다. */
export function toInput(values: FormValues, version: number, idempotencyKey: string): JudgmentInput {
  const base = { decision: values.decision!, memo: values.memo.trim(), version, idempotencyKey };
  return values.decision === 'error' ? { ...base, errorType: values.errorType, actionDone: values.actionDone } : base;
}

export function isDirty(values: FormValues) {
  return Boolean(values.decision || values.errorType || values.memo.trim() || values.actionDone);
}

export function saveErrorMessage(kind: ApiErrorKind) {
  switch (kind) {
    case 'network': return '네트워크 연결이 끊겨 저장하지 못했습니다. 연결을 확인한 뒤 다시 저장하세요.';
    case 'unauthorized': return '로그인이 만료돼 저장하지 못했습니다. 다시 로그인한 뒤 저장하세요.';
    case 'forbidden': return '판정 저장 권한이 없습니다. 관리약사에게 권한을 확인하세요.';
    case 'conflict': return '다른 약사가 먼저 판정을 저장했습니다. 화면을 다시 열어 저장된 판정을 확인하세요.';
    case 'not-found': return '검수 건을 찾을 수 없어 저장하지 못했습니다. 목록에서 다시 선택하세요.';
    case 'validation': return '입력값을 확인한 뒤 다시 저장하세요.';
    default: return '서버 오류로 저장하지 못했습니다. 잠시 후 다시 저장하세요.';
  }
}
