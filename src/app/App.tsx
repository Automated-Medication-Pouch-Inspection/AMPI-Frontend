import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { LiveMonitoringPage } from '../features/live/pages/LiveMonitoringPage';
import { JudgmentPage } from '../features/judgment/pages/JudgmentPage';
import { HistoryPage } from '../features/history/pages/HistoryPage';
import { NotFoundPage } from './NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/live" replace />} />
        <Route path="live" element={<LiveMonitoringPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="inspections/:id" element={<JudgmentPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
