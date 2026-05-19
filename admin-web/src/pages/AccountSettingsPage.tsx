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
    verificationCode: '',
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

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
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
        throw new Error('Failed to change password');
      }

      setMessage('✅ Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('❌ Error changing password: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Email
  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!emailForm.email.includes('@')) {
      setError('Please enter a valid email');
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
        throw new Error('Failed to add email');
      }

      setMessage('✅ Email added successfully!');
      setEmailForm({ email: '', verificationCode: '' });
    } catch (err) {
      setError('❌ Error adding email: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!adminForm.email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (adminForm.password.length < 8) {
      setError('Password must be at least 8 characters');
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
        throw new Error('Failed to create admin');
      }

      setMessage(`✅ Admin ${adminForm.name} created successfully!`);
      setAdminForm({ name: '', email: '', password: '', role: 'Moderator' });
    } catch (err) {
      setError('❌ Error creating admin: ' + (err instanceof Error ? err.message : 'Unknown error'));
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
          {/* Current Admin Info */}
          <div className="admin-info-card">
            <h3>Current Admin</h3>
            <p><strong>Name:</strong> {admin?.name}</p>
            <p><strong>Email:</strong> {admin?.email}</p>
            <p><strong>Role:</strong> <span className="role-badge">{admin?.role}</span></p>
          </div>

          {/* Messages */}
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="settings-form">
              <h2>🔐 Change Password</h2>
              <p className="form-description">Secure your account by updating your password regularly.</p>

              <div className="form-group">
                <label htmlFor="current-password">Current Password</label>
                <input
                  id="current-password"
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
                <label htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
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
                <label htmlFor="confirm-password">Confirm New Password</label>
                <input
                  id="confirm-password"
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
                {loading ? '⏳ Updating...' : '✅ Change Password'}
              </button>
            </form>
          )}

          {/* Add Email Tab */}
          {activeTab === 'email' && (
            <form onSubmit={handleAddEmail} className="settings-form">
              <h2>📧 Add Email Address</h2>
              <p className="form-description">Add an alternate email address to your admin account for notifications and recovery.</p>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={emailForm.email}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <p className="form-note">
                A verification link will be sent to your email. Please check and verify.
              </p>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Adding Email...' : '✅ Add Email'}
              </button>
            </form>
          )}

          {/* Add Admin Tab */}
          {activeTab === 'add-admin' && (
            <form onSubmit={handleAddAdmin} className="settings-form">
              <h2>👤 Create New Admin Account</h2>
              <p className="form-description">Invite another admin to manage the platform. Only Super Admins can create new admins.</p>

              <div className="form-group">
                <label htmlFor="admin-name">Admin Name</label>
                <input
                  id="admin-name"
                  type="text"
                  placeholder="Enter admin full name"
                  value={adminForm.name}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin-email">Admin Email</label>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="Enter admin email address"
                  value={adminForm.email}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin-password">Temporary Password</label>
                <input
                  id="admin-password"
                  type="password"
                  placeholder="Set temporary password (min. 8 characters)"
                  value={adminForm.password}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, password: e.target.value })
                  }
                  required
                />
                <small>The admin will be asked to change this on first login.</small>
              </div>

              <div className="form-group">
                <label htmlFor="admin-role">Role</label>
                <select
                  id="admin-role"
                  value={adminForm.role}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, role: e.target.value })
                  }
                  required
                >
                  <option value="Moderator">Moderator (Content Moderation)</option>
                  <option value="Admin">Admin (Full Access)</option>
                </select>
              </div>

              <div className="role-description">
                <strong>Role Descriptions:</strong>
                <ul>
                  <li><strong>Moderator:</strong> Can verify producers and manage content</li>
                  <li><strong>Admin:</strong> Full access including admin management</li>
                </ul>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Creating Admin...' : '✅ Create Admin'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
