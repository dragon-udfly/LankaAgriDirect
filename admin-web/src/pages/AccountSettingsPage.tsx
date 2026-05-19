import { useState } from 'react';
import { useAdminAuth } from '../context/AuthContext';
import '../styles/AccountSettings.css';

const AccountSettingsPage = () => {
  const { admin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'password' | 'email' | 'add-admin'>('password');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Change Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Add Email Form
  const [emailForm, setEmailForm] = useState({
    email: '',
  });

  // Add Admin Form
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Moderator',
  });

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!passwordForm.currentPassword) {
      setError('❌ Please enter your current password');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('❌ New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('❌ Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        try {
          const data = await response.json();
          throw new Error(data.message || `Error: ${response.status}`);
        } catch {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const data = await response.json();
      setMessage('✅ ' + (data.message || 'Password changed successfully!'));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('❌ ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Email
  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!emailForm.email) {
      setError('❌ Please enter an email address');
      return;
    }

    if (!emailForm.email.includes('@')) {
      setError('❌ Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/admin/add-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({
          email: emailForm.email,
        }),
      });

      if (!response.ok) {
        try {
          const data = await response.json();
          throw new Error(data.message || `Error: ${response.status}`);
        } catch {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const data = await response.json();
      setMessage('✅ ' + (data.message || 'Email added successfully!'));
      setEmailForm({ email: '' });
    } catch (err) {
      setError('❌ ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!adminForm.name) {
      setError('❌ Please enter admin name');
      return;
    }

    if (!adminForm.email) {
      setError('❌ Please enter admin email');
      return;
    }

    if (!adminForm.email.includes('@')) {
      setError('❌ Please enter a valid email');
      return;
    }

    if (!adminForm.password) {
      setError('❌ Please enter a temporary password');
      return;
    }

    if (adminForm.password.length < 8) {
      setError('❌ Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({
          name: adminForm.name,
          email: adminForm.email,
          password: adminForm.password,
          role: adminForm.role,
        }),
      });

      if (!response.ok) {
        try {
          const data = await response.json();
          throw new Error(data.message || `Error: ${response.status}`);
        } catch {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const data = await response.json();
      setMessage(`✅ ${data.message || 'Admin account created successfully!'}`);
      setAdminForm({ name: '', email: '', password: '', role: 'Moderator' });
    } catch (err) {
      setError('❌ ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-settings">
      <div className="settings-container">
        <div className="settings-sidebar">
          <button
            className={`settings-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            🔐 Change Password
          </button>
          <button
            className={`settings-tab ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            📧 Add Email
          </button>
          <button
            className={`settings-tab ${activeTab === 'add-admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('add-admin')}
          >
            👤 Add Another Admin
          </button>
        </div>

        <div className="settings-content">
          {/* Status Messages */}
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          {/* Current Admin Info */}
          <div className="admin-info-card">
            <h3>Current Admin</h3>
            <p><strong>Name:</strong> {admin?.name}</p>
            <p><strong>Email:</strong> {admin?.email}</p>
            <p><strong>Role:</strong> <span className="role-badge">{admin?.role}</span></p>
          </div>

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="settings-form">
              <h2>🔐 Change Password</h2>
              <p className="form-description">Secure your account by updating your password regularly.</p>

              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter your current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter your new password (min. 8 characters)"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm your new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '⏳ Updating...' : '🔒 Change Password'}
                </button>
              </form>
            </div>
          )}

          {/* Add Email Tab */}
          {activeTab === 'email' && (
            <div className="settings-form">
              <h2>📧 Add Email Address</h2>
              <p className="form-description">Add an alternate email address to your admin account for notifications and recovery.</p>

              <form onSubmit={handleAddEmail}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm({ email: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '⏳ Adding...' : '✉️ Add Email'}
                </button>
              </form>
            </div>
          )}

          {/* Add Admin Tab */}
          {activeTab === 'add-admin' && (
            <div className="settings-form">
              <h2>👤 Create New Admin Account</h2>
              <p className="form-description">Invite another admin to manage the platform. Only Super Admins can create new admins.</p>

              <form onSubmit={handleAddAdmin}>
                <div className="form-group">
                  <label>Admin Name</label>
                  <input
                    type="text"
                    placeholder="Enter admin full name"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Admin Email</label>
                  <input
                    type="email"
                    placeholder="Enter admin email address"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Temporary Password</label>
                  <input
                    type="password"
                    placeholder="Set temporary password (min. 8 characters)"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={adminForm.role}
                    onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                  >
                    <option value="Moderator">Moderator (Content Moderation)</option>
                    <option value="Admin">Admin (Full Access)</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '⏳ Creating...' : '➕ Create Admin'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
