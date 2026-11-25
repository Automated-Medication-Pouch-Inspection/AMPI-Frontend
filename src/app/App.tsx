import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { InspectionListPage } from '../features/inspections/pages/InspectionListPage';
import { InspectionDetailPage } from '../features/inspections/pages/InspectionDetailPage';
import { NotFoundPage } from './NotFoundPage';

export function App() {
  return <Routes><Route element={<AppLayout />}><Route index element={<InspectionListPage />} /><Route path="inspections/:id" element={<InspectionDetailPage />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes>;
}
