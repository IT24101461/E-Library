import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminAuth.module.css';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const AdminRegister = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  // Fix API endpoint - backend uses /api context path
  const apiUrl = `${API}/api`;

  // Validation helpers
  const validateEmail = (em) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
  };

  const passwordStrength = (pw) => {
    // at least 8 chars, one letter and one number
    return /(?=.{8,})(?=.*[A-Za-z])(?=.*\d)/.test(pw);
  };

  const handlePrepare = (e) => {
    e.preventDefault();
    setError(null);
    
    if (!fullName) return setError('Please enter your full name');
    if (!validateEmail(email)) return setError('Please enter a valid email address');
    if (!passwordStrength(password)) return setError('Password must be at least 8 characters with letters and numbers');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (!adminCode || adminCode.trim() === '') return setError('Please enter the admin access code');
    
    setConfirmOpen(true);
  };

  const handleConfirmRegister = async () => {
    setConfirmOpen(false);
    try {
      setLoading(true);
      const res = await axios.post(`${apiUrl}/auth/register`, {
        fullName,
        email,
        password,
        role: 'ADMIN',
        adminCode // Backend will verify this
      });

      // Verify response is ADMIN
      if (res.data.role !== 'ADMIN') {
        setError('Registration returned non-admin user. Contact system administrator.');
        return;
      }

      localStorage.setItem('authUser', JSON.stringify(res.data));
      localStorage.setItem('adminSession', 'true');
      setSuccessMsg('Admin account created successfully — redirecting to admin panel...');
      setTimeout(() => navigate('/admin-dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Invalid admin code or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['admin-auth-page']}>
      <div className={styles['admin-auth-wrapper']}>
        {/* Left Panel - Information */}
        <div className={styles['admin-branding']}>
          <div className={styles['admin-icon-large']}>🔐</div>
          <h2 className={styles['admin-brand-title']}>Request Admin Credentials</h2>
          <p className={styles['admin-brand-subtitle']}>Secure Registration Process</p>
          <div className={styles['admin-features']}>
            <div className={styles['feature-item']}>🔒 Requires admin access code</div>
            <div className={styles['feature-item']}>✓ Strong password validation</div>
            <div className={styles['feature-item']}>✓ Account confirmation required</div>
            <div className={styles['feature-item']}>✓ Full audit logging enabled</div>
          </div>
          <div className={styles['admin-notice']}>
            <strong>Contact System Administrator</strong><br/>
            to get your admin access code. This ensures only authorized personnel can create admin accounts.
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className={styles['admin-auth-card']}>
          <div className={styles['admin-auth-header']}>
            <div className={styles['admin-lock-icon']}>📝</div>
            <h2 className={styles['admin-auth-title']}>Create Admin Account</h2>
            <p className={styles['admin-auth-subtitle']}>Provide your information and access code</p>
          </div>

          {error && <div className={styles['admin-error']}>{error}</div>}
          {successMsg && <div className={styles['admin-success']}>{successMsg}</div>}

          <form onSubmit={handlePrepare} className={styles['admin-form']}>
            <div className={styles['form-group']}>
              <label className={styles['admin-label']}>
                <span className={styles['label-icon']}>👤</span>
                Full Name
              </label>
              <input
                type="text"
                className={styles['admin-input']}
                placeholder="John Administrator"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>

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
              />
            </div>

            <div className={styles['form-group']}>
              <label className={styles['admin-label']}>
                <span className={styles['label-icon']}>🔑</span>
                Password (min 8 chars, letters + numbers)
              </label>
              <input
                type="password"
                className={styles['admin-input']}
                placeholder="Create strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {password && (
                <div className={styles['password-strength']}>
                  {passwordStrength(password) ? (
                    <span className={styles['strength-good']}>✓ Strong password</span>
                  ) : (
                    <span className={styles['strength-weak']}>⚠ Needs improvement</span>
                  )}
                </div>
              )}
            </div>

            <div className={styles['form-group']}>
              <label className={styles['admin-label']}>
                <span className={styles['label-icon']}>🔐</span>
                Confirm Password
              </label>
              <input
                type="password"
                className={styles['admin-input']}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && password && (
                <div className={styles['password-match']}>
                  {password === confirmPassword ? (
                    <span className={styles['match-good']}>✓ Passwords match</span>
                  ) : (
                    <span className={styles['match-bad']}>✗ Passwords don't match</span>
                  )}
                </div>
              )}
            </div>

            <div className={styles['form-group']}>
              <label className={styles['admin-label']}>
                <span className={styles['label-icon']}>🛡️</span>
                Admin Access Code
              </label>
              <input
                type="password"
                className={styles['admin-input']}
                placeholder="Enter your admin code"
                value={adminCode}
                onChange={e => setAdminCode(e.target.value)}
              />
              <small className={styles['help-text']}>
                Provided by system administrator only
              </small>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={styles['admin-btn-submit']}
            >
              {loading ? 'Registering...' : 'Create Admin Account'}
            </button>
          </form>

          {confirmOpen && (
            <div className={styles['modal-overlay']}>
              <div className={styles['modal-content']}>
                <h3 className={styles['modal-title']}>Confirm Admin Registration</h3>
                <p className={styles['modal-text']}>
                  Please verify the following details before creating your admin account:
                </p>
                <div className={styles['confirm-details']}>
                  <div><strong>Name:</strong> {fullName}</div>
                  <div><strong>Email:</strong> {email}</div>
                  <div><strong>Role:</strong> ADMIN</div>
                </div>
                <div className={styles['modal-actions']}>
                  <button 
                    onClick={handleConfirmRegister}
                    className={styles['btn-confirm']}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Confirm & Create'}
                  </button>
                  <button 
                    onClick={() => setConfirmOpen(false)}
                    className={styles['btn-cancel']}
                    disabled={loading}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={styles['admin-footer']}>
            <p className={styles['admin-footer-text']}>
              Already have admin access?{' '}
              <Link to="/admin-login" className={styles['admin-link']}>
                Sign In
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

export default AdminRegister;
