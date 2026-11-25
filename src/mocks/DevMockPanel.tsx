import { Checkbox, InputNumber } from 'antd';
import { setDevOptions } from './mockStore';
import { useInspectionStore } from '../features/inspections/useInspectionStore';

// 개발 전용 패널(계획 §8 "지연과 실패 주입"). 빌드 결과물에는 포함되지 않는다(import.meta.env.DEV).
export function DevMockPanel() {
  const { dev, saveRequestCount } = useInspectionStore();
  return (
    <details className="dev-panel">
      <summary>개발용 시연 설정</summary>
      <div className="dev-panel-body">
        <label className="dev-row">
          저장 지연(ms)
          <InputNumber min={0} max={10000} step={100} value={dev.saveDelayMs} onChange={value => setDevOptions({ saveDelayMs: value ?? 0 })} aria-label="저장 지연(밀리초)" />
        </label>
        <Checkbox checked={dev.failSave} onChange={event => setDevOptions({ failSave: event.target.checked })}>판정 저장을 서버 오류로 실패시키기</Checkbox>
        <Checkbox checked={dev.device2Offline} onChange={event => setDevOptions({ device2Offline: event.target.checked })}>2호기 장비 오프라인</Checkbox>
        <Checkbox checked={dev.device2MaskingFailed} onChange={event => setDevOptions({ device2MaskingFailed: event.target.checked })}>2호기 장비 마스킹 실패</Checkbox>
        <p className="muted" data-testid="save-request-count">서버에 도달한 저장 요청 {saveRequestCount}회</p>
      </div>
    </details>
  );
}
