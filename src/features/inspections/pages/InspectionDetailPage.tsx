import { Alert, Card, Descriptions, Result, Typography } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { getInspection } from '../api';
import { InspectionStatusTag } from '../components/InspectionStatusTag';

export function InspectionDetailPage() {
  const { id = '' } = useParams();
  usePageTitle('검수 상세');
  const item = getInspection(id);
  if (!item) return <Result status="404" title="검수 건을 찾을 수 없습니다" extra={<Link to="/">목록으로 이동</Link>} />;
  return <><Link to="/">← 검수 목록</Link><Typography.Title level={1}>{item.id}</Typography.Title><div className="detail-grid"><Card title="촬영 이미지"><div className="image-placeholder">시연 이미지 미등록<br />장비 연동 시 촬영 이미지를 표시합니다.</div></Card><Card title="검수 정보"><Descriptions column={1} items={[{ key: 'medication', label: '기대 약품', children: item.expectedMedication }, { key: 'quantity', label: '기대 수량', children: `${item.expectedQuantity}개` }, { key: 'status', label: '검토 상태', children: <InspectionStatusTag status={item.status} /> }, { key: 'ai', label: 'AI 분석', children: item.aiSummary }]} /><Alert type="warning" message="결과 저장과 작업자 확인 기능은 서버 연결 단계에서 구현합니다." /></Card></div></>;
}
