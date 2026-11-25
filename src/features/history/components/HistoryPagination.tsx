import { Button } from 'antd';

interface Props {
  page: number;
  total: number;
  pageSize: number;
  busy: boolean;
  onChange: (page: number) => void;
}

/** 현재 쪽 주변 번호. 처음·끝 쪽은 항상 보이고 사이는 …로 줄인다. */
function pageWindow(page: number, last: number): (number | 'gap')[] {
  const shown = new Set([1, last, page - 1, page, page + 1].filter(value => value >= 1 && value <= last));
  if (page <= 3) [2, 3, 4].forEach(value => value <= last && shown.add(value));
  if (page >= last - 2) [last - 3, last - 2, last - 1].forEach(value => value >= 1 && shown.add(value));
  const sorted = [...shown].sort((a, b) => a - b);
  return sorted.flatMap((value, index) => (index > 0 && value - sorted[index - 1] > 1 ? ['gap' as const, value] : [value]));
}

// 페이지 이동(계획 §4-3): 해당 쪽이 있을 때만 활성. 요청 중 누르면 무시하고 실패하면 이전 쪽을 유지한다.
// 끝 쪽에 닿아 버튼이 비활성이 돼도 키보드 포커스를 잃지 않도록 disabled 대신 aria-disabled를 쓴다.
export function HistoryPagination({ page, total, pageSize, busy, onChange }: Props) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const go = (next: number) => { if (!busy && next !== page && next >= 1 && next <= last) onChange(next); };

  return (
    <nav className="history-pagination" aria-label="검수 이력 페이지">
      <span className="muted num">{from}–{to} / {total.toLocaleString('ko-KR')}건</span>
      <ul>
        <li><Button onClick={() => go(page - 1)} aria-disabled={busy || page <= 1 || undefined}>이전</Button></li>
        {pageWindow(page, last).map((value, index) => value === 'gap'
          ? <li key={`gap-${index}`} aria-hidden="true" className="muted">…</li>
          : (
            <li key={value}>
              <Button
                type={value === page ? 'primary' : 'default'}
                aria-current={value === page ? 'page' : undefined}
                aria-label={`${value}쪽`}
                aria-disabled={busy || undefined}
                onClick={() => go(value)}
              >
                {value}
              </Button>
            </li>
          ))}
        <li><Button onClick={() => go(page + 1)} aria-disabled={busy || page >= last || undefined}>다음</Button></li>
      </ul>
    </nav>
  );
}
