import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, BottomNav, nav, type Page } from './components/Sidebar';
import { ToastProvider } from './components/Toast';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { LeavesPage } from './pages/LeavesPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { OnLeavePage } from './pages/OnLeavePage';
import { EmployeeLeavesPage } from './pages/EmployeeLeavesPage';

const pagePath: Record<Page, string> = {
  dashboard: '/',
  employees: '/employees',
  leaves: '/leaves',
  'on-leave': '/on-leave',
  statistics: '/statistics',
};

const pathToPage = nav.reduce<Record<string, Page>>((acc, item) => {
  acc[pagePath[item.id]] = item.id;
  return acc;
}, {});

function getPageFromPath(pathname: string): Page {
  return pathToPage[pathname] ?? 'dashboard';
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const page = getPageFromPath(location.pathname);

  useEffect(() => {
    if (!(location.pathname in pathToPage) && !/^\/employees\/\d+\/leaves$/.test(location.pathname)) {
      navigate(pagePath.dashboard, { replace: true });
    }
  }, [location.pathname, navigate]);

  const setPage = (p: Page) => navigate(pagePath[p]);

  return (
    <div className="flex min-h-screen bg-[#f7f5f2]">
      <Sidebar current={page} onChange={setPage} />

      {/* Main content — add pb-16 on mobile so bottom nav doesn't overlap */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 pb-16 md:pb-0">
        <Routes>
          <Route path={pagePath.dashboard} element={<DashboardPage />} />
          <Route path={pagePath.employees} element={<EmployeesPage />} />
          <Route path={pagePath.leaves} element={<LeavesPage />} />
          <Route path={pagePath.statistics} element={<StatisticsPage />} />
          <Route path={pagePath['on-leave']} element={<OnLeavePage />} />
          <Route path="/employees/:employeeId/leaves" element={<EmployeeLeavesPage />} />
          <Route path="*" element={<Navigate to={pagePath.dashboard} replace />} />
        </Routes>
      </main>

      <BottomNav current={page} onChange={setPage} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
