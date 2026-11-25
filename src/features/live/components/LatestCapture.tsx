import { Link } from 'react-router-dom';
import { formatTime } from '../../../utils/formatDate';
import { AiResultTag } from '../../inspections/components/AiResultTag';
import { MaskedImage } from '../../inspections/components/MaskedImage';
import type { Device, Inspection } from '../../inspections/types';
import { fromLive } from '../liveSelectors';

// 선택 장비의 최신 촬영. 장비가 중단되면 마지막 성공 데이터임을 시각과 함께 밝힌다(E-01 공통 원칙).
export function LatestCapture({ device, latest }: { device: Device; latest: Inspection | undefined }) {
  const offline = device.connection === 'offline';
  return (
    <section className="panel" aria-labelledby="latest-capture-title">
      <div className="panel-heading">
        <h2 id="latest-capture-title">{device.name} · 최신 촬영</h2>
        <span className="muted">{offline ? '장비 연결 끊김 · 갱신 중단' : '카메라 켜짐 · 연속 판독'}</span>
      </div>
      {latest ? (
        <>
          <MaskedImage item={latest} device={device} />
          <div className="capture-meta">
            <AiResultTag result={latest.aiResult} />
            <span>
              {offline ? '마지막 성공 · ' : ''}{latest.sequenceNo} · {formatTime(latest.capturedAt)} · 기준 {latest.expectedCount}정 · 검출 {latest.detectedCount ?? '—'}
            </span>
            <Link to={`/inspections/${latest.id}`} state={fromLive}>판정 화면 열기</Link>
          </div>
        </>
      ) : (
        <div className="image-placeholder">첫 약포지를 기다리고 있습니다.</div>
      )}
    </section>
  );
}
