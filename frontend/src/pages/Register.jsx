
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Register.module.css';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const Register = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !fullName || password.length < 6) {
      setError('Please fill all fields. Password should be at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API}/auth/register`, { email, fullName, password });
      // Auto-login (server returns user info)
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Client-side validation helpers
  const validateEmail = (em) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
  };

  const passwordStrength = (pw) => {
    // at least 8 chars, one letter and one number
    return /(?=.{8,})(?=.*[A-Za-z])(?=.*\d)/.test(pw);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const prepareSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!fullName) return setError('Please enter your full name');
    if (!validateEmail(email)) return setError('Please enter a valid email address');
    if (!passwordStrength(password)) return setError('Password must be at least 8 characters and include letters and numbers');
    setConfirmOpen(true);
  };

  const confirmCreate = async () => {
    setConfirmOpen(false);
    try {
      setLoading(true);
      const res = await axios.post(`${API}/auth/register`, { email, fullName, password });
      localStorage.setItem('user', JSON.stringify(res.data));
      setSuccessMsg('Account created successfully — redirecting...');
      setTimeout(() => navigate('/'), 1400);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['auth-page']}>
      <div className={styles['auth-card']}>
        <div className={styles['auth-illustration']}>
          <div style={{maxWidth: 260}}>
            <svg width="100%" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect x="0" y="0" width="240" height="200" rx="12" fill="url(#g)" />
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#eef2ff" />
                  <stop offset="1" stopColor="#f8fafc" />
                </linearGradient>
              </defs>
            </svg>
            <div className="mt-4">
              <h3 className={"text-lg font-semibold"} style={{color:'#3730a3'}}>Welcome to E-Library</h3>
              <p className={styles['small-muted']}>Organize your reading, track progress, and discover new books.</p>
            </div>
          </div>
        </div>

        <div className={styles['auth-form-wrap']}>
          <div className="mb-6">
            <h2 className={styles['auth-title']}>Create account</h2>
            <p className={styles['auth-subtitle']}>Secure account with a strong password and get started</p>
          </div>

          {error && <div className={styles['notice-error']}>{error}</div>}
          {successMsg && <div className={styles['notice-success']}>{successMsg}</div>}

          <form onSubmit={prepareSubmit} className="space-y-4">
            <div>
              <label className={styles['form-label']}>Full name</label>
              <input className={styles['form-input']} placeholder="Jane Doe" value={fullName} onChange={e=>setFullName(e.target.value)} />
            </div>

            <div>
              <label className={styles['form-label']}>Email</label>
              <input className={styles['form-input']} placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>

            <div>
              <label className={styles['form-label']}>Password</label>
              <input type="password" className={styles['form-input']} placeholder="Choose a strong password" value={password} onChange={e=>setPassword(e.target.value)} />
              <div className="mt-2">
                <span className={styles['small-muted']}>Password must be at least 8 characters and include letters and numbers.</span>
              </div>
            </div>

            <div>
              <button type="submit" className={styles['btn-primary']} disabled={loading}>
                {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div> : null}
                <span>{loading ? 'Creating...' : 'Create account'}</span>
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-indigo-600 font-medium">Sign in</Link>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div className={styles['modal-backdrop']}>
          <div className={styles['modal-card']}>
            <h3 className="text-lg font-bold mb-2">Confirm account creation</h3>
            <p className="text-sm text-gray-600 mb-4">Create account for <span className="font-medium">{fullName}</span> ({email})?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmOpen(false)} className={styles['btn-secondary']}>Cancel</button>
              <button onClick={confirmCreate} className={styles['btn-primary']}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
