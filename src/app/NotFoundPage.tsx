import { Result } from 'antd';
import { Link } from 'react-router-dom';

export function NotFoundPage() { return <Result status="404" title="화면을 찾을 수 없습니다" extra={<Link to="/">검수 목록으로 이동</Link>} />; }
