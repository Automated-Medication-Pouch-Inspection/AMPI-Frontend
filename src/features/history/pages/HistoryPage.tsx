import { Alert, Button, Skeleton, Table } from 'antd';
import { useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { formatDate } from '../../../utils/formatDate';
import { AiResultTag } from '../../inspections/components/AiResultTag';
import { DecisionTag } from '../../inspections/components/DecisionTag';
import { errorTypeLabels } from '../../inspections/constants';
import type { Inspection } from '../../inspections/types';
import { useDevices } from '../../inspections/useInspectionStore';
import { HistoryFilterForm } from '../components/HistoryFilterForm';
import { HistoryPagination } from '../components/HistoryPagination';
import { defaultFilters, describeFilters, isDefaultFilters, parseHistoryQuery, queryKey, toSearchParams, type HistoryFilters, type HistoryQuery } from '../historyQuery';
import { historyErrorMessage, useHistoryResults } from '../useHistoryResults';

// S-05 검수 이력. 조건은 URL에 있어 새로고침·뒤로 가기·상세에서 복귀할 때 같은 조건과 결과로 돌아온다.
// CSV·PDF 내보내기는 팀 결정(§5-2 #5) 전이라 넣지 않는다.
export function HistoryPage() {
  usePageTitle('검수 이력');
  const devices = useDevices();
  const [params, setParams] = useSearchParams();
  const applied = parseHistoryQuery(params);
  const urlKey = queryKey(applied);
  const commit = useCallback((query: HistoryQuery) => setParams(toSearchParams(query)), [setParams]);
  const { result, loading, error, run, retry } = useHistoryResults(urlKey, commit);
  const currentUrl = `/history${urlKey ? `?${urlKey}` : ''}`;
  const submit = (filters: HistoryFilters) => run({ ...filters, page: 1 });
  const headingRef = useRef<HTMLHeadingElement>(null);
  // 빈 결과의 초기화 버튼은 조회 후 사라지므로 포커스를 결과 제목으로 옮긴다.
  const resetButton = !isDefaultFilters(applied) && (
    <Button onClick={() => { submit(defaultFilters); headingRef.current?.focus(); }}>조건 초기화</Button>
  );

  return (
    <div className="screen-stack">
      <div className="screen-heading">
        <div>
          <h1>검수 이력</h1>
          <p className="muted">약포지 촬영 기록과 약사 판정을 조회합니다.</p>
        </div>
      </div>

      <HistoryFilterForm applied={applied} devices={devices} busy={loading} onSubmit={submit} />

      <p className="sr-only" role="status">
        {loading ? '검수 이력을 불러오는 중…' : result ? `조회 결과 ${result.total}건` : ''}
      </p>

      <section className="panel" aria-labelledby="history-result-title" aria-busy={loading}>
        <div className="panel-heading">
          <div>
            <h2 id="history-result-title" ref={headingRef} tabIndex={-1}>
              {result ? <>조회 결과 <span className="num">{result.total.toLocaleString('ko-KR')}</span>건 · 최신순</> : '조회 결과'}
            </h2>
            <p className="muted small result-summary">
              적용 조건: {describeFilters(applied, devices)}
              {result && <> · <span className="num">{result.range.from === result.range.to ? result.range.from : `${result.range.from} ~ ${result.range.to}`}</span></>}
            </p>
          </div>
          <span className="muted">시연 데이터</span>
        </div>

        {error && (
          <Alert
            className="history-error"
            type="error"
            showIcon
            role="alert"
            message="검수 이력을 불러오지 못했습니다"
            description={`${historyErrorMessage(error.kind)}${result ? ' 아래는 이전에 불러온 결과입니다.' : ''}`}
            // 다시 시도가 끝나면 이 알림이 사라지므로 포커스를 결과 제목으로 옮긴다.
            action={<Button onClick={() => { retry(); headingRef.current?.focus(); }} aria-disabled={loading || undefined}>다시 시도</Button>}
          />
        )}

        {!result && loading && (
          <div className="history-loading">
            <p className="muted">검수 이력을 불러오는 중…</p>
            <Skeleton active paragraph={{ rows: 6 }} title={false} />
          </div>
        )}

        {result && result.total === 0 && (
          <div className="history-empty">
            <p className="empty-title">조건에 맞는 검수 이력이 없습니다.</p>
            <p className="muted">기간을 넓히거나 다른 조건으로 조회하세요.</p>
            {resetButton}
          </div>
        )}

        {result && result.total > 0 && (
          <>
            <Table<Inspection>
              rowKey="id"
              dataSource={result.items}
              loading={loading}
              pagination={false}
              scroll={{ x: 760 }}
              columns={[
                { title: '촬영 시각', key: 'capturedAt', render: (_, item) => <span className="num">{formatDate(item.capturedAt)}</span> },
                { title: '장비 / 약포지', key: 'device', render: (_, item) => `${item.deviceName} · ${item.sequenceNo}` },
                { title: '기준 / 검출', key: 'count', render: (_, item) => <span className="num">{item.expectedCount} / {item.detectedCount ?? '—'}</span> },
                { title: 'AI 결과', key: 'ai', render: (_, item) => <AiResultTag result={item.aiResult} /> },
                {
                  title: '약사 판정',
                  key: 'decision',
                  render: (_, item) => (
                    <span className="decision-cell">
                      <DecisionTag judgment={item.judgment} needsReview={item.aiResult !== 'match'} />
                      {item.judgment?.errorType && <span className="muted small">{errorTypeLabels[item.judgment.errorType]}</span>}
                    </span>
                  ),
                },
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
            <HistoryPagination
              page={result.page}
              total={result.total}
              pageSize={result.pageSize}
              busy={loading}
              onChange={page => run({ ...applied, page })}
            />
          </>
        )}
      </section>
    </div>
  );
}
