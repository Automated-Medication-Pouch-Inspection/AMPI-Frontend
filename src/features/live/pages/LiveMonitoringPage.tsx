import { Button, Tooltip } from 'antd';
import { useState } from 'react';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { selectDeviceTimeline, selectUnconfirmed, useInspectionStore } from '../../inspections/useInspectionStore';
import { DeviceCard } from '../components/DeviceCard';
import { LatestCapture } from '../components/LatestCapture';
import { RecentTimeline } from '../components/RecentTimeline';
import { SummaryCards } from '../components/SummaryCards';
import { UnconfirmedList } from '../components/UnconfirmedList';

// S-03 실시간 검수. 장비 실제 제어는 장비 연동 후 제공한다(계획 §4-3).
export function LiveMonitoringPage() {
  usePageTitle('실시간 검수');
  const { inspections, devices } = useInspectionStore();
  const [deviceId, setDeviceId] = useState(devices[0].id);
  const device = devices.find(item => item.id === deviceId) ?? devices[0];
  const timeline = selectDeviceTimeline(inspections, device.id).reverse();
  const unconfirmed = selectUnconfirmed(inspections);

  return (
    <div className="screen-stack">
      <div className="screen-heading">
        <div>
          <h1>실시간 검수</h1>
          <p className="muted">장비별 촬영 현황과 약사 확인이 필요한 약포지를 살펴보세요.</p>
        </div>
      </div>

      <SummaryCards items={inspections} />

      <section aria-labelledby="devices-title" className="screen-stack tight">
        <div className="section-heading">
          <h2 id="devices-title">장비 현황</h2>
          <div className="device-controls">
            <span className="muted">선택 장비: {device.name}</span>
            <Tooltip title="장비 연동 후 제공">
              <Button disabled>판독 일시정지</Button>
            </Tooltip>
            <Tooltip title="장비 연동 후 제공">
              <Button disabled>새 처방 시작</Button>
            </Tooltip>
            <span className="muted small">장비 조작은 장비 연동 후 제공</span>
          </div>
        </div>
        <div className="device-grid">
          {devices.map(item => {
            const ordered = selectDeviceTimeline(inspections, item.id);
            return (
              <DeviceCard
                key={item.id}
                device={item}
                latest={ordered[ordered.length - 1]}
                todayCount={ordered.length}
                selected={item.id === device.id}
                onSelect={() => setDeviceId(item.id)}
              />
            );
          })}
        </div>
      </section>

      <div className="live-grid">
        <LatestCapture device={device} latest={timeline[0]} />
        <RecentTimeline device={device} items={timeline.slice(0, 8)} />
      </div>

      <UnconfirmedList items={unconfirmed} />
    </div>
  );
}
