
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.css';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const Login = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Pre-fill credentials from registration
  useEffect(() => {
    const userEmail = searchParams.get('email');
    const pwd = searchParams.get('password');
    if (userEmail) setEmail(userEmail);
    if (pwd) setPassword(pwd);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    try {
      setLoading(true);
<<<<<<< HEAD
      const res = await axios.post(`${API}/api/auth/login`, { email, password });
=======
      const res = await axios.post(`${API}/auth/login`, { email, password });
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
      localStorage.setItem('authUser', JSON.stringify(res.data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const [successMsg, setSuccessMsg] = useState(null);

  const doLogin = async () => {
    try {
      setLoading(true);
<<<<<<< HEAD
        const res = await axios.post(`${API}/api/auth/login`, { email, password });
=======
      const res = await axios.post(`${API}/auth/login`, { email, password });
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
      localStorage.setItem('authUser', JSON.stringify(res.data));
      setSuccessMsg('Signed in successfully — redirecting...');
      setTimeout(() => navigate('/'), 900);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // keep handleSubmit for compatibility with form.
  const handleConfirmedSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    await doLogin();
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

        {error && <div className={styles['login-error']}>{error}</div>}
        {successMsg && <div className={styles['login-success']}>{successMsg}</div>}

        <form onSubmit={handleConfirmedSubmit} className="space-y-4">
          <label className={styles['login-label']}>Email</label>
          <input
            className={styles['login-input']}
            placeholder="you@example.com"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            autoComplete="email"
          />

          <label className={styles['login-label']}>Password</label>
          <input
            type="password"
            className={styles['login-input']}
            placeholder="Your password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button className={styles['login-btn']} disabled={loading}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : null}
            <span>{loading ? 'Signing in...' : 'Sign in'}</span>
          </button>
        </form>

        <div className={styles['login-footer']}>
          Don't have an account? <Link to="/register" className={styles['login-link']}>Create one</Link>
<<<<<<< HEAD
          <div style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd', fontSize: '0.85rem'}}>
            <Link to="/admin-login" style={{color: '#667eea', textDecoration: 'none', fontWeight: '600'}}>
              🔐 Admin Access
            </Link>
          </div>
=======
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
        </div>
      </div>
    </div>
  );
};

export default Login;
