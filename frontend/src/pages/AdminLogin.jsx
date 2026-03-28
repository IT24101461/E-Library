import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminAuth.module.css';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  // Fix API endpoint - backend uses /api context path
  const apiUrl = `${API}/api`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${apiUrl}/auth/login`, { email, password });
      
      // Verify admin role
      if (res.data.role !== 'ADMIN') {
        setError('Only admins can access the admin portal. Please use the regular login.');
        return;
      }

      localStorage.setItem('authUser', JSON.stringify(res.data));
      localStorage.setItem('adminSession', 'true');
      setSuccessMsg('Admin credentials verified — redirecting to admin panel...');
      setTimeout(() => navigate('/admin-dashboard'), 900);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['admin-auth-page']}>
      <div className={styles['admin-auth-wrapper']}>
        {/* Left Panel - Branding */}
        <div className={styles['admin-branding']}>
          <div className={styles['admin-icon-large']}>🛡️</div>
          <h2 className={styles['admin-brand-title']}>Admin Portal</h2>
          <p className={styles['admin-brand-subtitle']}>Secure Management Dashboard</p>
          <div className={styles['admin-features']}>
            <div className={styles['feature-item']}>✓ User Management</div>
            <div className={styles['feature-item']}>✓ Book Management</div>
            <div className={styles['feature-item']}>✓ Activity Tracking</div>
            <div className={styles['feature-item']}>✓ System Analytics</div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className={styles['admin-auth-card']}>
          <div className={styles['admin-auth-header']}>
            <div className={styles['admin-lock-icon']}>🔐</div>
            <h2 className={styles['admin-auth-title']}>Admin Access</h2>
            <p className={styles['admin-auth-subtitle']}>Verify your credentials to access admin panel</p>
          </div>

          {error && <div className={styles['admin-error']}>{error}</div>}
          {successMsg && <div className={styles['admin-success']}>{successMsg}</div>}

          <form onSubmit={handleSubmit} className={styles['admin-form']}>
            <div className={styles['form-group']}>
              <label className={styles['admin-label']}>
                <span className={styles['label-icon']}>📧</span>
                Email Address
              </label>
              <input
                type="email"
                className={styles['admin-input']}
                placeholder="admin@elibrary.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className={styles['form-group']}>
              <label className={styles['admin-label']}>
                <span className={styles['label-icon']}>🔑</span>
                Password
              </label>
              <input
                type="password"
                className={styles['admin-input']}
                placeholder="Enter your secure password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={styles['admin-btn-submit']}
            >
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </button>
          </form>

          <div className={styles['admin-footer']}>
            <p className={styles['admin-footer-text']}>
              Don't have admin credentials?{' '}
              <Link to="/admin-register" className={styles['admin-link']}>
                Request Admin Access
              </Link>
            </p>
            <p className={styles['admin-footer-text']}>
              <Link to="/login" className={styles['admin-link-secondary']}>
                Back to User Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
