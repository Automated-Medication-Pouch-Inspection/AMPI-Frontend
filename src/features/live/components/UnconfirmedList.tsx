import { Link } from 'react-router-dom';
import { formatTime } from '../../../utils/formatDate';
import { AiResultTag } from '../../inspections/components/AiResultTag';
import type { Inspection } from '../../inspections/types';
import { fromLive } from '../liveSelectors';

function reason(item: Inspection) {
  if (item.aiResult === 'unreadable') return '판독 불가 · 약사 확인 필요';
  if (item.detectedCount !== null && item.detectedCount < item.expectedCount) return `정제 부족 의심 · 기준 ${item.expectedCount}정 · 검출 ${item.detectedCount}정`;
  return `정제 과다 의심 · 기준 ${item.expectedCount}정 · 검출 ${item.detectedCount}정`;
}

// 확인이 필요한 약포지(전체 장비). 약사 판정 전까지 목록에 남는다(V1-305).
export function UnconfirmedList({ items }: { items: Inspection[] }) {
  return (
    <section className="panel" aria-labelledby="unconfirmed-title">
      <div className="panel-heading">
        <h2 id="unconfirmed-title">확인이 필요한 약포지 · <span data-testid="list-unconfirmed">{items.length}</span>건</h2>
        <span className="muted">전체 장비</span>
      </div>
      {items.length ? (
        <ul className="review-list">
          {items.map(item => (
            <li className="review-row" key={item.id}>
              <div className="review-text">
                <strong>{item.deviceName} · {item.sequenceNo}</strong>
                <span className="muted">{reason(item)} · {formatTime(item.capturedAt)}</span>
              </div>
              <AiResultTag result={item.aiResult} />
              <Link className="button-link primary" to={`/inspections/${item.id}`} state={fromLive} aria-label={`${item.deviceName} ${item.sequenceNo} 약포지 확인`}>
                약포지 확인
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">확인이 필요한 약포지가 없습니다.</p>
      )}
      <p className="muted list-footnote">약사 판정 전까지 이 목록에 유지됩니다.</p>
    </section>
  );
}
