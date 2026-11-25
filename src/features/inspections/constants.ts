import type { AiResult, Decision, ErrorType } from './types';

// 화면 문구 기준(D-006). AI 결과를 최종 판정처럼 표현하지 않는다.
export const aiResultLabels: Record<AiResult, string> = {
  match: '개수 일치',
  suspected: '이상 가능성',
  unreadable: '판독 불가',
};

export const decisionLabels: Record<Decision, string> = {
  error: '실제 오류',
  'false-positive': 'AI 오검출',
};

export const unconfirmedLabel = '미확인';

export const errorTypeLabels: Record<ErrorType, string> = {
  missing: '정제 부족',
  extra: '정제 과다',
  'wrong-drug': '다른 약품',
  foreign: '이물질',
  packaging: '포장 불량',
  other: '기타',
};

export const errorTypes = Object.keys(errorTypeLabels) as ErrorType[];
