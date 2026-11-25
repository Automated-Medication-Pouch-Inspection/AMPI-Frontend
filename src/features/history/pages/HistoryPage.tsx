import { Button, Checkbox, Select, Table } from 'antd';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { formatDate } from '../../../utils/formatDate';
import { aiResultLabels } from '../../inspections/constants';
import { AiResultTag } from '../../inspections/components/AiResultTag';
import { DecisionTag } from '../../inspections/components/DecisionTag';
import type { AiResult, Inspection } from '../../inspections/types';
import { useInspectionStore } from '../../inspections/useInspectionStore';
import { PAGE_SIZE, applyHistoryQuery, isDefaultQuery, parseHistoryQuery, toSearchParams, type HistoryQuery } from '../historyQuery';

// S-05 검수 이력(1단계 최소 범위). 조건은 모두 URL에 있어 새로고침·복귀 시 그대로 복원된다.
// 조회 버튼·기간·약사 판정·오류 유형 필터, CSV·PDF 내보내기는 2단계 이후에 다룬다.
export function HistoryPage() {
  usePageTitle('검수 이력');
  const { inspections, devices } = useInspectionStore();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const query = parseHistoryQuery(params);
  const rows = applyHistoryQuery(inspections, query);
  const lastPage = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(query.page, lastPage);
  const currentUrl = `${location.pathname}${location.search}`;

  const update = (patch: Partial<HistoryQuery>) => setParams(toSearchParams({ ...query, page: 1, ...patch }));

  return (
    <div className="screen-stack">
      <div className="screen-heading">
        <div>
          <h1>검수 이력</h1>
          <p className="muted">약포지 촬영 기록과 약사 판정을 조회합니다. 기본 조회: 오늘 · 최신순</p>
        </div>
      </div>

      <section className="panel filters" aria-label="조회 조건">
        <div className="field inline">
          <label htmlFor="filter-device">장비</label>
          <Select
            id="filter-device"
            value={query.device ?? 'all'}
            onChange={value => update({ device: value === 'all' ? null : value })}
            options={[{ value: 'all', label: '전체 장비' }, ...devices.map(device => ({ value: device.id, label: device.name }))]}
          />
        </div>
        <div className="field inline">
          <label htmlFor="filter-ai">AI 결과</label>
          <Select
            id="filter-ai"
            value={query.ai ?? 'all'}
            onChange={value => update({ ai: value === 'all' ? null : (value as AiResult) })}
            options={[{ value: 'all', label: '전체' }, ...(Object.keys(aiResultLabels) as AiResult[]).map(value => ({ value, label: aiResultLabels[value] }))]}
          />
        </div>
        <Checkbox className="touch-checkbox" checked={query.unconfirmed} onChange={event => update({ unconfirmed: event.target.checked })}>미확인만 보기</Checkbox>
        <Button onClick={() => setParams(new URLSearchParams())} disabled={isDefaultQuery(query)}>조건 초기화</Button>
        <span className="muted small">전체 필터(기간·약사 판정·오류 유형)와 조회 버튼은 다음 단계에서 제공합니다.</span>
      </section>

      <section className="panel" aria-labelledby="history-result-title">
        <div className="panel-heading">
          <h2 id="history-result-title">조회 결과 {rows.length}건 · 최신순</h2>
          <span className="muted">시연 데이터</span>
        </div>
        <Table<Inspection>
          rowKey="id"
          dataSource={rows}
          scroll={{ x: 760 }}
          locale={{ emptyText: '조건에 맞는 검수 이력이 없습니다. 조건을 바꾸거나 초기화하세요.' }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: rows.length,
            showSizeChanger: false,
            showTotal: (total, range) => `${range[0]}–${range[1]} / ${total}건`,
            onChange: next => setParams(toSearchParams({ ...query, page: next })),
          }}
          columns={[
            { title: '촬영 시각', key: 'capturedAt', render: (_, item) => <span className="num">{formatDate(item.capturedAt)}</span> },
            { title: '장비 / 약포지', key: 'device', render: (_, item) => `${item.deviceName} · ${item.sequenceNo}` },
            { title: '기준 / 검출', key: 'count', render: (_, item) => <span className="num">{item.expectedCount} / {item.detectedCount ?? '—'}</span> },
            { title: 'AI 결과', key: 'ai', render: (_, item) => <AiResultTag result={item.aiResult} /> },
            { title: '약사 판정', key: 'decision', render: (_, item) => <DecisionTag judgment={item.judgment} needsReview={item.aiResult !== 'match'} /> },
            { title: '판정자', key: 'judgedBy', render: (_, item) => item.judgment?.judgedBy ?? '—' },
            {
              title: '상세',
              key: 'detail',
              render: (_, item) => (
                <Link className="table-link" to={`/inspections/${item.id}`} state={{ from: { screen: 'history', url: currentUrl } }} aria-label={`${item.deviceName} ${item.sequenceNo} 상세 보기`}>
                  상세 보기
                </Link>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}
