import { useEffect, useState } from 'react';
import { getUserStats, getProductStats } from '../api/adminApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
  const [userStats, setUserStats] = useState<any>(null);
  const [productStats, setProductStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getUserStats(), getProductStats()])
      .then(([u, p]) => { setUserStats(u.data); setProductStats(p.data); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner"><div className="loader" /></div>;

  const categoryData = productStats?.byCategory
    ? Object.entries(productStats.byCategory).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="page">
      <div className="page-header"><h3>📊 Dashboard Overview</h3></div>
      {error && <div className="alert alert-error"><span>✖</span>{error}</div>}

      {/* User Stats */}
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>Producers</p>
      <div className="stat-grid">
        {[
          { label: 'Total Producers',   value: userStats?.totalProducers,   icon: '👩‍🌾' },
          { label: 'Verified',          value: userStats?.verifiedProducers, icon: '✅' },
          { label: 'Pending Review',    value: userStats?.pendingProducers,  icon: '⏳' },
          { label: 'Blocked',           value: userStats?.blockedProducers,  icon: '🚫' },
          { label: 'Total Admins',      value: userStats?.totalAdmins,       icon: '🛡️' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value ?? 0}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Product Stats */}
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', margin: '24px 0 12px', textTransform: 'uppercase', letterSpacing: '.5px' }}>Products</p>
      <div className="stat-grid">
        {[
          { label: 'Total Products',   value: productStats?.totalProducts,    icon: '📦' },
          { label: 'Active',           value: productStats?.activeProducts,    icon: '🟢' },
          { label: 'Sold Out',         value: productStats?.soldOutProducts,   icon: '🔴' },
          { label: 'Suspended',        value: productStats?.suspendedProducts, icon: '⛔' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value ?? 0}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category Chart */}
      {categoryData.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <p style={{ fontWeight: 700, marginBottom: 16 }}>Products by Category</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
