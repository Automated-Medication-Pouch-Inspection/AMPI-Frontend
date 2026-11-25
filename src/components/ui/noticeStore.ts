import { useSyncExternalStore } from 'react';

// 화면 이동 뒤에 보여줄 결과 안내. 레이아웃에 항상 있는 aria-live 영역이 이 값을 보여준다.
// location.state에 두면 새로고침·뒤로 가기 때 지난 안내가 다시 보이므로 메모리에만 둔다.

export interface Notice { id: number; message: string; /** 안내를 보여줄 화면의 pathname */ path: string }

let notice: Notice | null = null;
let nextId = 1;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getNotice = () => notice;
const emit = () => listeners.forEach(listener => listener());

export function showNotice(message: string, path: string) { notice = { id: nextId++, message, path }; emit(); }
export function clearNotice() { notice = null; emit(); }
export function useNotice() { return useSyncExternalStore(subscribe, getNotice, getNotice); }
