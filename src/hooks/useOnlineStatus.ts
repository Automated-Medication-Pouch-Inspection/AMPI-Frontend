import { useSyncExternalStore } from 'react';

// 브라우저 자체의 네트워크 연결 상태. 장비 연결 상태와는 별개다(계획 §3-1).

let offlineSince: Date | null = typeof navigator !== 'undefined' && !navigator.onLine ? new Date() : null;

function subscribe(listener: () => void) {
  const sync = () => {
    offlineSince = navigator.onLine ? null : offlineSince ?? new Date();
    listener();
  };
  window.addEventListener('online', sync);
  window.addEventListener('offline', sync);
  return () => {
    window.removeEventListener('online', sync);
    window.removeEventListener('offline', sync);
  };
}

const getOnline = () => navigator.onLine;

export function useOnlineStatus() {
  const online = useSyncExternalStore(subscribe, getOnline, () => true);
  return { online, offlineSince: online ? null : offlineSince };
}
