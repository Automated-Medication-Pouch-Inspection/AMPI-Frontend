import { NavLink, Outlet } from 'react-router-dom';
import { navigation, upcomingNavigation } from '../../constants/navigation';
import { DemoNotice } from '../ui/DemoNotice';
import { ConnectionBanner } from '../ui/ConnectionBanner';
import { FlashNotice } from '../ui/FlashNotice';
import { useDevices, useUnconfirmedCount } from '../../features/inspections/useInspectionStore';
import { DevMockPanel } from '../../mocks/DevMockPanel';

export function AppLayout() {
  const unconfirmed = useUnconfirmedCount();
  const devices = useDevices();
  const onlineDevices = devices.filter(device => device.connection === 'online').length;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">본문으로 이동</a>
      <header className="topbar">
        <div className="topbar-main">
          <div className="topbar-brand">
            <strong className="brand" translate="no">MEDILUX</strong>
            <span className="product-name">약포장 검수</span>
          </div>
          <div className="topbar-right">
            <span className="pharmacy">메디약국</span>
            <span className={`device-summary ${onlineDevices < devices.length ? 'warn' : ''}`}>장비 {onlineDevices}/{devices.length} 연결</span>
            <span className="unconfirmed-badge" aria-label={`미확인 ${unconfirmed}건`} data-testid="topbar-unconfirmed">
              미확인 <b>{unconfirmed}</b>건
            </span>
            <span className="avatar" aria-label="로그인 사용자 김약사(시연)">김</span>
          </div>
        </div>
        <nav className="topnav" aria-label="주 메뉴">
          {navigation.map(item => <NavLink key={item.path} to={item.path}>{item.label}</NavLink>)}
          {upcomingNavigation.map(label => (
            <span key={label} className="nav-placeholder" aria-disabled="true" title="이후 단계에서 제공">{label}</span>
          ))}
        </nav>
      </header>
      <ConnectionBanner />
      <main id="main-content" className="main-content" tabIndex={-1}>
        <DemoNotice />
        <FlashNotice />
        <Outlet />
        {import.meta.env.DEV && <DevMockPanel />}
      </main>
    </div>
  );
}
