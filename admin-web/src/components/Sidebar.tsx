
import { useAdminAuth } from '../context/AuthContext';

interface NavItem { icon: string; label: string; page: string; }

const NAV: NavItem[] = [
  { icon: '📊', label: 'Dashboard',     page: 'dashboard' },
  { icon: '👩‍🌾', label: 'Producers',     page: 'producers' },
  { icon: '📦', label: 'Products',      page: 'products' },
  { icon: '📋', label: 'Audit Logs',    page: 'audit-logs' },
];

interface Props { activePage: string; onNavigate: (page: string) => void; }

const Sidebar = ({ activePage, onNavigate }: Props) => {
  const { admin, signOut } = useAdminAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ fontSize: 28, marginBottom: 6 }}>🌿</div>
        <h1>Lanka Agri-Direct</h1>
        <p>Admin Portal</p>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(item => (
          <button
            key={item.page}
            className={`nav-item ${activePage === item.page ? 'active' : ''}`}
            onClick={() => onNavigate(item.page)}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,.1)' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginBottom: 4 }}>Signed in as</div>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 12 }}>{admin?.name}</div>
        <button className="btn btn-secondary" style={{ width: '100%', fontSize: 13 }} onClick={signOut}>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
