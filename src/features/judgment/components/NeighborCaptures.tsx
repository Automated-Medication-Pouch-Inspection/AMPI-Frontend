import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { formatTime } from '../../../utils/formatDate';
import { AiResultTag } from '../../inspections/components/AiResultTag';
import { MaskedImage } from '../../inspections/components/MaskedImage';
import type { Device, Inspection } from '../../inspections/types';
import type { EntryState } from '../useReturnTarget';

interface Props {
  previous: Inspection | undefined;
  next: Inspection | undefined;
  device: Device | undefined;
  entryState: EntryState;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, to: string) => void;
}

// 직전·직후 약포지. 이동해도 진입 정보(state)를 넘겨 복귀 위치를 유지한다.
export function NeighborCaptures({ previous, next, device, entryState, onNavigate }: Props) {
  const slots = [{ label: '직전 약포지', item: previous }, { label: '직후 약포지', item: next }];
  return (
    <section className="neighbor-grid" aria-label="직전·직후 약포지">
      {slots.map(({ label, item }) => (
        <div className="panel neighbor" key={label}>
          <h3>{label}{item ? ` · ${item.sequenceNo}` : ''}</h3>
          {item ? (
            <>
              <MaskedImage item={item} device={device} size="small" />
              <div className="capture-meta">
                <AiResultTag result={item.aiResult} />
                <span className="muted">{formatTime(item.capturedAt)}</span>
              </div>
              <Link to={`/inspections/${item.id}`} state={entryState} onClick={event => onNavigate(event, `/inspections/${item.id}`)}>
                {item.sequenceNo} 판정 화면 보기
              </Link>
            </>
          ) : (
            <p className="muted">{label}가 없습니다.</p>
          )}
        </div>
      ))}
    </section>
  );
}
