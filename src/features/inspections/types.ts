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

/** 이력 조회 기간. 기준일은 서버가 정한다(시연은 가상 데이터 기준일). */
export type HistoryPeriod = 'today' | 'yesterday' | '7d' | '30d';

/** 이력 조회 요청(계획 §5-3: 필터 값, page, pageSize). 정렬은 최신순 고정. */
export interface HistorySearch {
  period: HistoryPeriod;
  deviceId: string | null;
  aiResult: AiResult | null;
  decision: Decision | null;
  errorType: ErrorType | null;
  unconfirmedOnly: boolean;
  page: number;
  pageSize: number;
}

export interface HistoryPage {
  items: Inspection[];
  total: number;
  /** 실제로 돌려준 페이지. 요청 페이지가 마지막 페이지를 넘으면 마지막 페이지로 맞춘다. */
  page: number;
  pageSize: number;
  /** 기간의 시작·끝 날짜(YYYY-MM-DD, 한국 시간) */
  range: { from: string; to: string };
}
