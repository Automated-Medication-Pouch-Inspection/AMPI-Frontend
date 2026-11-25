import { Input, Select, Space, Table, Typography } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { formatDate } from '../../../utils/formatDate';
import { getInspections } from '../api';
import { InspectionStatusTag } from '../components/InspectionStatusTag';
import type { Inspection } from '../types';

export function InspectionListPage() {
  usePageTitle('검수 목록');
  const [params, setParams] = useSearchParams();
  const search = params.get('q') || '';
  const status = params.get('status') || 'all';
  function updateParam(key: string, value: string) { const next = new URLSearchParams(params); if (!value || value === 'all') next.delete(key); else next.set(key, value); setParams(next, { replace: true }); }
  const rows = getInspections().filter(item => `${item.id} ${item.expectedMedication} ${item.deviceName}`.toLowerCase().includes(search.toLowerCase()) && (status === 'all' || item.status === status));
  return <><Typography.Title level={1}>검수 목록</Typography.Title><p>검수 건을 선택해 기대 정보와 분석 상태를 확인하세요.</p><Space wrap className="filters"><Input aria-label="검수 검색" placeholder="검수 ID·약품·장비 검색" value={search} onChange={event => updateParam('q', event.target.value)} allowClear /><Select aria-label="검수 상태" value={status} onChange={value => updateParam('status', value)} options={[{ value: 'all', label: '전체 상태' }, { value: 'needs-review', label: '확인 필요' }, { value: 'pending', label: '대기' }]} /></Space><Table<Inspection> rowKey="id" dataSource={rows} scroll={{ x: 720 }} locale={{ emptyText: '조건에 맞는 검수 건이 없습니다.' }} pagination={false} columns={[{ title: '검수 ID', dataIndex: 'id', render: (id: string) => <Link to={`/inspections/${id}`}>{id}</Link> }, { title: '약품', dataIndex: 'expectedMedication' }, { title: '장비', dataIndex: 'deviceName' }, { title: '상태', dataIndex: 'status', render: (_, row) => <InspectionStatusTag status={row.status} /> }, { title: '수신 시각 (한국)', dataIndex: 'createdAt', render: formatDate }]} /></>;
}
