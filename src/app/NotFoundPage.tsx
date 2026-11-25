import { Result } from 'antd';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

export function NotFoundPage() {
  usePageTitle('화면을 찾을 수 없음');
  return <Result status="404" title="화면을 찾을 수 없습니다" subTitle="주소를 확인하거나 실시간 검수 화면으로 이동하세요." extra={<Link className="button-link" to="/live">실시간 검수로</Link>} />;
}
