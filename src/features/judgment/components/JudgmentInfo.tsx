import { formatDate } from '../../../utils/formatDate';
import { errorTypeLabels } from '../../inspections/constants';
import { AiResultTag } from '../../inspections/components/AiResultTag';
import { DecisionTag } from '../../inspections/components/DecisionTag';
import type { Inspection } from '../../inspections/types';

// 판정 정보: 장비·약포지, 촬영 시각, AI 결과, 저장된 약사 판정.
export function JudgmentInfo({ item }: { item: Inspection }) {
  const { judgment } = item;
  return (
    <dl className="detail-list">
      <div><dt>장비 / 약포지</dt><dd>{item.deviceName} / {item.sequenceNo}</dd></div>
      <div><dt>촬영 시각</dt><dd>{formatDate(item.capturedAt)}</dd></div>
      <div>
        <dt>AI 결과</dt>
        <dd><AiResultTag result={item.aiResult} /> 기준 {item.expectedCount}정 · 검출 {item.detectedCount ?? '—'}</dd>
      </div>
      <div>
        <dt>약사 판정</dt>
        <dd>
          <DecisionTag judgment={judgment} needsReview={item.aiResult !== 'match'} />
          {judgment && (
            <span className="muted">
              {judgment.errorType ? `${errorTypeLabels[judgment.errorType]} · ` : ''}
              {judgment.decision === 'error' ? `조치 ${judgment.actionDone ? '완료' : '미완료'} · ` : ''}
              {judgment.judgedBy} · {formatDate(judgment.judgedAt)}
            </span>
          )}
        </dd>
      </div>
      {judgment?.memo && <div><dt>메모</dt><dd>{judgment.memo}</dd></div>}
    </dl>
  );
}
