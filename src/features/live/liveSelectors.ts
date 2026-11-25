import { isUnconfirmed } from '../inspections/useInspectionStore';
import type { Inspection } from '../inspections/types';

export function countUnconfirmedOf(items: Inspection[]) {
  return items.filter(isUnconfirmed).length;
}

/** S-03에서 S-04로 들어갈 때 넘기는 진입 정보(계획 §4-2). */
export const fromLive = { from: { screen: 'live' as const } };
