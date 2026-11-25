// 상단 탭. 장비 상태(S-06)·통계(S-11)는 이후 단계에서 제공하므로 자리만 표시한다.
export const navigation = [
  { path: '/live', label: '실시간 검수' },
  { path: '/history', label: '검수 이력' },
] as const;

export const upcomingNavigation = ['장비 상태', '통계'] as const;
