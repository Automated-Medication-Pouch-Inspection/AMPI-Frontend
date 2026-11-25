import { Layout } from 'antd';
import { NavLink, Outlet } from 'react-router-dom';
import { navigation } from '../../constants/navigation';
import { DemoNotice } from '../ui/DemoNotice';

export function AppLayout() { return <Layout className="app-shell"><a className="skip-link" href="#main-content">본문으로 이동</a><aside className="sidebar"><div className="brand">Medilux</div><p>약품 검수 업무</p><nav aria-label="주 메뉴">{navigation.map(item => <NavLink key={item.path} to={item.path} end>{item.label}</NavLink>)}</nav></aside><Layout><header className="topbar">Medilux 프런트엔드 개발용</header><main id="main-content" className="main-content"><DemoNotice /><Outlet /></main></Layout></Layout>; }
