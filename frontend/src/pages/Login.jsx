
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.css';
import { API_BASE_URL, getApiUrl } from '../config/ApiConfig';

const Login = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  // Pre-fill credentials from registration
  useEffect(() => {
    const userEmail = searchParams.get('email');
    const pwd = searchParams.get('password');
    if (userEmail) setEmail(userEmail);
    if (pwd) setPassword(pwd);
    
    // Log API configuration for debugging
    console.log('[Login] API URL configured:', getApiUrl());
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const loginUrl = `${apiUrl}/auth/login`;
      
      console.log('[Login] Attempting login to:', loginUrl);
      console.log('[Login] Email:', email);

      const res = await axios.post(loginUrl, { email, password }, {
        timeout: 10000, // 10 second timeout
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('[Login] Success! User:', res.data);

      // Store user data
      localStorage.setItem('authUser', JSON.stringify(res.data));
      setSuccessMsg('Signed in successfully — redirecting...');
      
      setTimeout(() => {
        navigate('/');
      }, 900);
    } catch (err) {
      console.error('[Login] Error:', err);

      // Better error messages based on error type
      let errorMsg = 'Login failed';

      if (!err.response) {
        // Network error
        errorMsg = `⚠️ Cannot connect to server. Check if backend is running at: ${getApiUrl()}`;
      } else if (err.response.status === 401 || err.response.status === 400) {
        // Authentication error
        errorMsg = err.response?.data?.error || 'Invalid email or password';
      } else if (err.response.status === 500) {
        // Server error
        errorMsg = 'Server error. Please try again later.';
      } else {
        errorMsg = err.response?.data?.error || errorMsg;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['login-page']}>
      <div className={styles['login-card']}>
        <div className={styles['login-header']}>
          <div className={styles['login-icon']}>
            <span>📚</span>
          </div>
          <div>
            <h2 className={styles['login-title']}>Welcome back</h2>
            <p className={styles['login-subtitle']}>Sign in to continue to your library</p>
          </div>
        </div>

        {error && (
          <div className={styles['login-error']}>
            {error}
            <button 
              type="button"
              onClick={() => setError(null)}
              style={{
                marginTop: '0.5rem',
                fontSize: '0.85rem',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '0.4rem 0.8rem',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          </div>
        )}
        {successMsg && <div className={styles['login-success']}>{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={styles['login-label']}>Email</label>
            <input
              className={styles['login-input']}
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              type="email"
              required
            />
          </div>

          <div>
            <label className={styles['login-label']}>Password</label>
            <input
              type="password"
              className={styles['login-input']}
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button className={styles['login-btn']} disabled={loading} type="submit">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : null}
            <span>{loading ? 'Signing in...' : 'Sign in'}</span>
          </button>
        </form>

        <div className={styles['login-footer']}>
          Don't have an account? <Link to="/register" className={styles['login-link']}>Create one</Link>
          <div style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd', fontSize: '0.85rem'}}>
            <Link to="/admin-login" style={{color: '#667eea', textDecoration: 'none', fontWeight: '600'}}>
              🔐 Admin Access
            </Link>
          </div>
        </div>
      </div>

      {/* Debug Console for troubleshooting */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.8)',
          color: '#0f0',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
          maxWidth: '300px',
          fontFamily: 'monospace',
          maxHeight: '150px',
          overflowY: 'auto',
          zIndex: 9999
        }}>
          <div><strong>🔧 Debug Info:</strong></div>
          <div>API: {getApiUrl()}</div>
          <div>Mode: {process.env.NODE_ENV}</div>
          <div>Email: {email || '(empty)'}</div>
        </div>
      )}
    </div>
  );
};

export default Login;
