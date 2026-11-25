import { Tag } from 'antd';
import { formatTime } from '../../../utils/formatDate';
import type { Device, Inspection } from '../../inspections/types';

interface Props {
  device: Device;
  latest: Inspection | undefined;
  todayCount: number;
  selected: boolean;
  onSelect: () => void;
}

// 장비 카드. 장비 오프라인은 여기에만 표시하고 브라우저 연결 배너와 섞지 않는다(완료 조건 8).
export function DeviceCard({ device, latest, todayCount, selected, onSelect }: Props) {
  const offline = device.connection === 'offline';
  return (
    <button type="button" className={`device-card ${selected ? 'selected' : ''} ${offline ? 'offline' : ''}`} aria-pressed={selected} onClick={onSelect} data-testid={`device-card-${device.id}`}>
      <span className="device-card-title">
        <strong>{device.name}</strong> · {device.mode}
      </span>
      {offline ? <Tag color="red">검수 중단</Tag> : <Tag color="green">검수 중</Tag>}
      <small>기준 패턴 {device.pattern} · 세션 {device.sessionNo} · {todayCount}포 검수</small>
      {offline && (
        <span className="device-alert" role="note">
          {device.name} 검수가 중단됐습니다 · {device.offlineSince ? formatTime(device.offlineSince) : '—'} 장비 연결 끊김
          {latest && <> · 마지막 성공 {latest.sequenceNo} ({formatTime(latest.capturedAt)})</>}
        </span>
      )}
    </button>
  );
}
