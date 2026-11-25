import { countUnconfirmedOf } from '../liveSelectors';
import type { Inspection } from '../../inspections/types';

// 상단 집계 3개. 범위는 전체 장비(계획 §5-2 #7 제안). 시연 데이터 건수 기준이다.
export function SummaryCards({ items }: { items: Inspection[] }) {
  const suspected = items.filter(item => item.aiResult === 'suspected').length;
  const unreadable = items.filter(item => item.aiResult === 'unreadable' && !item.judgment).length;
  const unconfirmed = countUnconfirmedOf(items);
  return (
    <section className="summary-grid" aria-label="오늘 검수 집계 · 전체 장비">
      <div className="summary-card">
        <span className="metric-label">오늘 검수한 약포지 · 전체 장비</span>
        <strong className="metric-value">{items.length.toLocaleString('ko-KR')}</strong>
        <small>포지 촬영 기준 · 시연 데이터</small>
      </div>
      <div className="summary-card">
        <span className="metric-label">AI 이상 가능성 · 전체 장비</span>
        <strong className="metric-value">{suspected}</strong>
        <small>실제 오류 여부는 약사 판정 필요</small>
      </div>
      <div className="summary-card emphasis">
        <span className="metric-label">미확인 이상 · 전체 장비</span>
        <strong className="metric-value" data-testid="summary-unconfirmed">{unconfirmed}</strong>
        <small>{unreadable ? `판독 불가 ${unreadable}건 포함` : '판독 불가 없음'}</small>
      </div>
    </section>
  );
}
