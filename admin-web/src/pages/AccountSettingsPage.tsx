import { useEffect, useState } from 'react';
import { getAdminProfile, updateAdminProfile } from '../api/adminApi';
import { useAdminAuth } from '../context/AuthContext';

const AccountSettingsPage = () => {
  const { admin, signIn } = useAdminAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getAdminProfile()
      .then(res => {
        setName(res.data.name || '');
        setUsername(res.data.username || '');
      })
      .catch(err => setError(err.message || 'Unable to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!name.trim()) {
      setError('Admin name is required.');
      return;
    }
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }

    const payload: {
      name: string;
      username: string;
      password?: string;
      currentPassword?: string;
    } = {
      name: name.trim(),
      username: username.trim(),
    };

    if (password) {
      if (password.length < 8) {
        setError('New password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
      if (!currentPassword) {
        setError('Current password is required to change your password.');
        return;
      }
      payload.password = password;
      payload.currentPassword = currentPassword;
    }

    setLoading(true);
    try {
      await updateAdminProfile(payload);
      setMessage('Account settings updated successfully.');
      if (admin) {
        signIn(localStorage.getItem('admin_token') || '', {
          ...admin,
          name: name.trim(),
        });
      }
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header"><h3>⚙️ Account Settings</h3></div>

      {error && <div className="alert alert-error"><span>✖</span> {error}</div>}
      {message && <div className="alert alert-success"><span>✔</span> {message}</div>}

      <div className="card" style={{ maxWidth: 680, padding: 24 }}>
        <p style={{ margin: '0 0 18px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Manage your admin account details here. Change your username, update your display name, or set a new password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Display Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Admin display name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Admin username"
            />
          </div>

          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password to save changes"
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave blank to keep existing password"
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
