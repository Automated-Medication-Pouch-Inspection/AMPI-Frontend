import { Tag } from 'antd';
import { decisionLabels, unconfirmedLabel } from '../constants';
import type { Judgment } from '../types';

/** 약사 판정 표시. 판정이 없으면 미확인. AI 결과와 섞지 않는다. */
export function DecisionTag({ judgment, needsReview = true }: { judgment: Judgment | null; needsReview?: boolean }) {
  if (!judgment) return needsReview ? <Tag color="red">{unconfirmedLabel}</Tag> : <span className="muted">—</span>;
  return <Tag color={judgment.decision === 'error' ? 'volcano' : 'blue'}>{decisionLabels[judgment.decision]}</Tag>;
}
