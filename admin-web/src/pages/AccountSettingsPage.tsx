import React, { useState } from 'react';
import { useAdminAuth } from '../context/AuthContext';

const AccountSettingsPage = () => {
  const { admin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Form
  const [profileData, setProfileData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
  });

  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Security Settings
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Call API to update profile
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters!' });
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to update password
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityChange = (key: string, value: any) => {
    setSecurity({ ...security, [key]: value });
  };

  const saveSecuritySettings = async () => {
    setLoading(true);
    try {
      // TODO: Call API to save security settings
      setMessage({ type: 'success', text: 'Security settings updated!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 28 }}>
        <h3>⚙️ Account Settings</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Manage your profile, security, and account preferences
        </p>
      </div>

      {/* Alert Messages */}
      {message.text && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: 20 }}>
          <span>{message.type === 'success' ? '✓' : '✖'}</span>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="settings-tabs" style={{ marginBottom: 28 }}>
        {(['profile', 'password', 'security'] as const).map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'var(--text)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontWeight: 500,
              marginRight: 8,
              transition: 'all .15s',
            }}>
            {tab === 'profile' && '👤 Profile'}
            {tab === 'password' && '🔐 Password'}
            {tab === 'security' && '🛡️ Security'}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h4 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>Personal Information</h4>
          <form onSubmit={handleProfileSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                }}
              />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                We'll send verification to this email before updating
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h4 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>Change Password</h4>
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                }}
              />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                At least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h4 style={{ marginBottom: 24, fontSize: 16, fontWeight: 700 }}>Security Settings</h4>

          {/* Two Factor Authentication */}
          <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <h5 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Two-Factor Authentication</h5>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Add an extra layer of security to your account
                </p>
              </div>
              <label style={{ position: 'relative', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={security.twoFactorEnabled}
                  onChange={(e) => handleSecurityChange('twoFactorEnabled', e.target.checked)}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
              </label>
            </div>
          </div>

          {/* Login Alerts */}
          <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <h5 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Login Alerts</h5>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Get notified of suspicious login attempts
                </p>
              </div>
              <label style={{ position: 'relative', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={security.loginAlerts}
                  onChange={(e) => handleSecurityChange('loginAlerts', e.target.checked)}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
              </label>
            </div>
          </div>

          {/* Session Timeout */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
              Session Timeout (minutes)
            </label>
            <select
              value={security.sessionTimeout}
              onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 14,
                fontFamily: 'inherit',
              }}>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={480}>8 hours</option>
            </select>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              You'll be logged out after this period of inactivity
            </p>
          </div>

          <button
            onClick={saveSecuritySettings}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Saving...' : 'Save Security Settings'}
          </button>
        </div>
      )}

      {/* Account Info Section */}
      <div style={{ marginTop: 40 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
          Account Information
        </h4>
        <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Account ID</p>
            <p style={{ fontSize: 14, fontWeight: 500 }}>{admin?.id || 'N/A'}</p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Account Status</p>
            <span className="badge badge-active">✓ Active</span>
          </div>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Member Since</p>
            <p style={{ fontSize: 14, fontWeight: 500 }}>Jan 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
