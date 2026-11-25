import type { ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';

export function AppProviders({ children }: { children: ReactNode }) {
  return <ConfigProvider locale={koKR} theme={{ token: { colorPrimary: '#2457a7', borderRadius: 6, fontFamily: 'system-ui, sans-serif', controlHeight: 44 } }}>{children}</ConfigProvider>;
}
