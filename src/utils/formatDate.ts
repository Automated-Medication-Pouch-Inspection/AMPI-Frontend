const dateTime = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'Asia/Seoul' });
const time = new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Seoul' });
const shortTime = new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Seoul' });

export function formatDate(value: string) { return dateTime.format(new Date(value)); }
export function formatTime(value: string | Date) { return time.format(new Date(value)); }
export function formatShortTime(value: string | Date) { return shortTime.format(new Date(value)); }
