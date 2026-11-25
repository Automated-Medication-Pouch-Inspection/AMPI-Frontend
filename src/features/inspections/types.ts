// 공유 도메인 타입. AI 결과·약사 판정·조치·마스킹은 서로 독립된 상태 축이다(계획 §3-1).

/** 서버가 발급하는 전역 고유 ID(D-001). 프런트는 해석하지 않고 문자열로만 다룬다. */
export type InspectionId = string;

export type AiResult = 'match' | 'suspected' | 'unreadable';
export type Decision = 'error' | 'false-positive';
export type ErrorType = 'missing' | 'extra' | 'wrong-drug' | 'foreign' | 'packaging' | 'other';
export type MaskingStatus = 'ok' | 'failed' | 'unknown';
export type DeviceConnection = 'online' | 'offline';

/** 검출 위치. 이미지 크기에 대한 비율(0~1)이다. */
export interface Detection { x: number; y: number; width: number; height: number }

export interface Judgment {
  decision: Decision;
  errorType?: ErrorType;
  memo: string;
  actionDone?: boolean;
  judgedBy: string;
  judgedAt: string;
}

export interface Inspection {
  id: InspectionId;
  deviceId: string;
  deviceName: string;
  /** 장비별 표시 번호(예: #0142). 주소에는 쓰지 않는다. */
  sequenceNo: string;
  capturedAt: string;
  expectedCount: number;
  detectedCount: number | null;
  aiResult: AiResult;
  detections: Detection[];
  image: { url: string | null; maskingStatus: MaskingStatus };
  judgment: Judgment | null;
  version: number;
}

export interface Device {
  id: string;
  name: string;
  mode: string;
  pattern: string;
  sessionNo: string;
  connection: DeviceConnection;
  /** 장비 단위 마스킹 상태. 실패·알 수 없음이면 그 장비의 이미지는 모두 차단한다. */
  maskingStatus: MaskingStatus;
  offlineSince: string | null;
}

/** 판정 저장 요청 본문. AI 오검출이면 errorType·actionDone을 넣지 않는다. */
export interface JudgmentInput {
  decision: Decision;
  errorType?: ErrorType;
  memo: string;
  actionDone?: boolean;
  version: number;
  idempotencyKey: string;
}

export interface SaveResult { inspection: Inspection; unconfirmedCount: number }
