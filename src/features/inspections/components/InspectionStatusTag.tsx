import { Tag } from 'antd';
import { statusLabels } from '../constants';
import type { InspectionStatus } from '../types';

export function InspectionStatusTag({ status }: { status: InspectionStatus }) { return <Tag color={status === 'needs-review' ? 'orange' : 'default'}>{statusLabels[status]}</Tag>; }
