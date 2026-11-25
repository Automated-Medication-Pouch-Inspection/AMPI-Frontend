import { useLocation } from 'react-router-dom';

// 진입 경로 → 복귀 링크(계획 §4-2, D-003, D-004).

export type EntryState = { from?: { screen: 'live' } | { screen: 'history'; url: string } } | null;

export interface ReturnTarget { to: string; pathname: string; label: string }

const live: ReturnTarget = { to: '/live', pathname: '/live', label: '실시간 검수로' };

export function resolveReturnTarget(state: unknown): ReturnTarget {
  const from = (state as EntryState)?.from;
  // 이력 URL은 앱 안의 /history 주소만 받는다(외부 주소로 이동하지 않도록).
  if (from?.screen === 'history' && typeof from.url === 'string' && /^\/history(\?|$)/.test(from.url)) {
    return { to: from.url, pathname: '/history', label: '검수 이력으로' };
  }
  // 실시간 검수에서 왔거나, 진입 정보가 없는 직접 접속은 /live(D-004).
  return live;
}

export function useReturnTarget() {
  const location = useLocation();
  return { target: resolveReturnTarget(location.state), entryState: location.state as EntryState };
}
