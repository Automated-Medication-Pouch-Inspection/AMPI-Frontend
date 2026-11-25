import { Tag } from 'antd';
import { aiResultLabels } from '../constants';
import type { AiResult } from '../types';

const colors: Record<AiResult, string> = { match: 'green', suspected: 'orange', unreadable: 'gold' };

export function AiResultTag({ result }: { result: AiResult }) {
  return <Tag color={colors[result]}>AI {aiResultLabels[result]}</Tag>;
}
