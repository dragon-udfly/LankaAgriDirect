import { useState } from 'react';
import './index.css';
import { AdminAuthProvider, useAdminAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProducersPage from './pages/ProducersPage';
import ProductsPage from './pages/ProductsPage';
import AuditLogsPage from './pages/AuditLogsPage';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard Overview',
  producers: 'Producer Management',
  products: 'Content Moderation',
  'audit-logs': 'Audit Logs',
};

const AdminApp = () => {
  const { admin } = useAdminAuth();
  const [page, setPage] = useState('dashboard');

  if (!admin) return <LoginPage />;

  const renderPage = () => {
    switch (page) {
      case 'dashboard':  return <DashboardPage />;
      case 'producers':  return <ProducersPage />;
      case 'products':   return <ProductsPage />;
      case 'audit-logs': return <AuditLogsPage />;
      default:           return <DashboardPage />;
    }
  };

  return (
    <div className="layout">
      <Sidebar activePage={page} onNavigate={setPage} />
      <div className="main-content">
        <header className="topbar">
          <h2>{PAGE_TITLES[page] || 'Admin'}</h2>
          <div className="topbar-right">
            <span className="admin-badge">🛡️ {admin.name}</span>
          </div>
        </header>
        {renderPage()}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AdminAuthProvider>
      <AdminApp />
    </AdminAuthProvider>
  );
}
