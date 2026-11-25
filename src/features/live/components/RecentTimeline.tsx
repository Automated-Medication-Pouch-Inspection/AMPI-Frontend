import { Link } from 'react-router-dom';
import { AiResultTag } from '../../inspections/components/AiResultTag';
import { DecisionTag } from '../../inspections/components/DecisionTag';
import type { Device, Inspection } from '../../inspections/types';
import { fromLive } from '../liveSelectors';

// 최근 약포지 판정(선택 장비, 최신 8건). 각 타일은 S-04 링크다.
export function RecentTimeline({ device, items }: { device: Device; items: Inspection[] }) {
  return (
    <section className="panel" aria-labelledby="timeline-title">
      <div className="panel-heading">
        <h2 id="timeline-title">최근 약포지 판정 · {device.name}</h2>
        <span className="muted">최신순 {items.length}건</span>
      </div>
      {items.length ? (
        <ol className="timeline">
          {items.map(item => (
            <li key={item.id}>
              <Link to={`/inspections/${item.id}`} state={fromLive} className={`timeline-item ${item.aiResult}`}>
                <strong>{item.sequenceNo}</strong>
                <span>기준 {item.expectedCount} · 검출 {item.detectedCount ?? '—'}</span>
                <span className="tag-row">
                  <AiResultTag result={item.aiResult} />
                  {item.aiResult !== 'match' && <DecisionTag judgment={item.judgment} />}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted">첫 약포지를 기다리고 있습니다.</p>
      )}
    </section>
  );
}
