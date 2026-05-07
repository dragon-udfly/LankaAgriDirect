import React, { useState } from 'react';
import { adminLogin } from '../api/adminApi';
import { useAdminAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { signIn } = useAdminAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginId || !password) { setError('Please enter username and password.'); return; }
    setLoading(true);
    try {
      const res = await adminLogin({ loginId, password });
      const { token, id, name, role } = res.data;
      if (role !== 'ADMIN') { setError('Access denied. Admin accounts only.'); return; }
      signIn(token, { id, name, role });
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="card" style={{ width: 400, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🌿</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>Lanka Agri-Direct</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Admin Dashboard</p>
        </div>

        {error && <div className="alert alert-error"><span>✖</span> {error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input value={loginId} onChange={e => setLoginId(e.target.value)} placeholder="Admin username" autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8, padding: '12px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
