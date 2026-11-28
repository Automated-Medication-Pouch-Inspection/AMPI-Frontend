import { Button, Checkbox, Select } from 'antd';
import { useRef, useState, type FormEvent } from 'react';
import { aiResultLabels, decisionLabels, errorTypeLabels, errorTypes, historyPeriodLabels } from '../../inspections/constants';
import type { AiResult, Decision, Device, ErrorType, HistoryPeriod } from '../../inspections/types';
import { defaultFilters, isDefaultFilters, normalizeFilters, sameFilters, type HistoryFilters } from '../historyQuery';

interface Props {
  /** URL에 적용된 조건 */
  applied: HistoryFilters;
  devices: Device[];
  busy: boolean;
  onSubmit: (filters: HistoryFilters) => void;
}

const ALL = 'all';
const options = <T extends string>(labels: Record<T, string>, allLabel: string) => [
  { value: ALL, label: allLabel },
  ...(Object.keys(labels) as T[]).map(value => ({ value, label: labels[value] })),
];

// 조회 조건 입력. 바꾼 값은 "조회"를 눌러야 적용된다(계획 §4-3). 실패하면 입력을 그대로 둔다.
export function HistoryFilterForm({ applied, devices, busy, onSubmit }: Props) {
  const [draft, setDraft] = useState(applied);
  const [synced, setSynced] = useState(applied);
  const submitRef = useRef<HTMLButtonElement>(null);

  // URL 조건이 바뀌면(조회 성공·뒤로 가기·복귀) 입력도 그 조건으로 맞춘다.
  if (!sameFilters(synced, applied)) {
    setSynced(applied);
    setDraft(applied);
  }

  const dirty = !sameFilters(draft, applied);
  const canReset = !isDefaultFilters(applied) || !isDefaultFilters(draft);
  const update = (patch: Partial<HistoryFilters>) => setDraft(current => normalizeFilters({ ...current, ...patch }));

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!busy) onSubmit(draft);
  }

  function reset() {
    if (busy || !canReset) return;
    setDraft(defaultFilters);
    onSubmit(defaultFilters);
    // 초기화 뒤 이 버튼이 비활성으로 바뀌므로 포커스를 조회 버튼으로 옮긴다.
    submitRef.current?.focus();
  }

  return (
    <form className="panel history-filters" aria-label="조회 조건" onSubmit={submit}>
      <div className="filters">
        <div className="field inline">
          <label htmlFor="filter-period">기간</label>
          <Select
            id="filter-period"
            value={draft.period}
            onChange={value => update({ period: value as HistoryPeriod })}
            options={(Object.keys(historyPeriodLabels) as HistoryPeriod[]).map(value => ({ value, label: historyPeriodLabels[value] }))}
          />
        </div>
        <div className="field inline">
          <label htmlFor="filter-device">장비</label>
          <Select
            id="filter-device"
            value={draft.device ?? ALL}
            onChange={value => update({ device: value === ALL ? null : value })}
            options={[{ value: ALL, label: '전체 장비' }, ...devices.map(device => ({ value: device.id, label: device.name }))]}
          />
        </div>
        <div className="field inline">
          <label htmlFor="filter-ai">AI 결과</label>
          <Select
            id="filter-ai"
            value={draft.ai ?? ALL}
            onChange={value => update({ ai: value === ALL ? null : (value as AiResult) })}
            options={options(aiResultLabels, '전체')}
          />
        </div>
        <div className="field inline">
          <label htmlFor="filter-decision">약사 판정</label>
          <Select
            id="filter-decision"
            value={draft.decision ?? ALL}
            disabled={draft.unconfirmed}
            aria-describedby={draft.unconfirmed ? 'filter-unconfirmed-help' : undefined}
            onChange={value => update({ decision: value === ALL ? null : (value as Decision) })}
            options={options(decisionLabels, '전체')}
          />
        </div>
        <div className="field inline">
          <label htmlFor="filter-error-type">오류 유형</label>
          <Select
            id="filter-error-type"
            value={draft.errorType ?? ALL}
            disabled={draft.unconfirmed || draft.decision === 'false-positive'}
            aria-describedby={draft.unconfirmed ? 'filter-unconfirmed-help' : draft.decision === 'false-positive' ? 'filter-error-type-help' : undefined}
            onChange={value => update({ errorType: value === ALL ? null : (value as ErrorType) })}
            options={[{ value: ALL, label: '전체' }, ...errorTypes.map(value => ({ value, label: errorTypeLabels[value] }))]}
          />
        </div>
        <Checkbox className="touch-checkbox" checked={draft.unconfirmed} onChange={event => update({ unconfirmed: event.target.checked })}>
          미확인만 보기
        </Checkbox>
        <div className="filter-actions">
          <Button htmlType="button" onClick={reset} disabled={!canReset}>조건 초기화</Button>
          {/* 요청 중에도 포커스를 잃지 않도록 disabled 대신 aria-disabled를 쓰고, 재요청은 무시한다. */}
          <Button ref={submitRef} type="primary" htmlType="submit" aria-disabled={busy} className={busy ? 'is-busy' : undefined}>
            {busy ? '조회 중…' : '조회'}
          </Button>
        </div>
      </div>
      <div className="filter-notes" aria-live="polite">
        {draft.unconfirmed && <p id="filter-unconfirmed-help" className="muted small">미확인만 보기를 켜면 약사 판정·오류 유형은 적용하지 않습니다.</p>}
        {!draft.unconfirmed && draft.decision === 'false-positive' && <p id="filter-error-type-help" className="muted small">오류 유형은 실제 오류 판정에만 있습니다.</p>}
        {dirty && <p className="dirty-note small">조건을 바꿨습니다. “조회”를 눌러야 결과에 반영됩니다.</p>}
        {!dirty && <p className="muted small">기본 조회: 오늘 · 최신순</p>}
      </div>
    </form>
  );
}
