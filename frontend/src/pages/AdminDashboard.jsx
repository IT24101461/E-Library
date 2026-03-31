import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminDashboard.module.css';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const raw = localStorage.getItem('authUser');
  const user = raw ? JSON.parse(raw) : null;
  const mountedRef = useRef(true);

  // Verify admin role
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/admin-login');
    }
  }, [user, navigate]);

  // Statistics
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalActivity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // Users Management
  const [users, setUsers] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState({ fullName: '', email: '', role: 'USER' });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({ userId: null, newPassword: '', confirmPassword: '' });

  // Books Management
  const [books, setBooks] = useState([]);
  const [showBookForm, setShowBookForm] = useState(false);
  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    description: '',
    isbn: '',
  });

  // Feedbacks
  const [feedbacks, setFeedbacks] = useState([]);

  // Active Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch Statistics
  const fetchStats = async () => {
    try {
      const booksRes = await axios.get(`${API}/api/books`);
      const usersRes = await axios.get(`${API}/api/admin/users?userId=${user.id}`);
      
      if (!mountedRef.current) return;

      setStats({
        totalBooks: Array.isArray(booksRes.data) ? booksRes.data.length : 0,
        totalUsers: Array.isArray(usersRes.data) ? usersRes.data.length : 0,
        totalActivity: 0, // Can be expanded later
      });
    } catch (e) {
      console.error('Failed to fetch stats', e);
      setStatusMessage('Failed to fetch statistics');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/users?userId=${user.id}`);
      if (!mountedRef.current) return;
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch users', e);
      setStatusMessage('Failed to fetch users');
    }
  };

  // Fetch Books
  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${API}/api/books`);
      if (!mountedRef.current) return;
      setBooks(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch books', e);
      setStatusMessage('Failed to fetch books');
    }
  };

  // Fetch Feedbacks
  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`${API}/api/v1/feedback`);
      if (!mountedRef.current) return;
      setFeedbacks(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch feedbacks', e);
      setStatusMessage('Failed to fetch feedbacks');
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchStats();
    fetchUsers();
    fetchBooks();
    fetchFeedbacks();
    return () => { mountedRef.current = false; };
    // eslint-disable-next-line
  }, []);

  // USER CRUD OPERATIONS
  const handleCreateUser = async () => {
    if (!userFormData.fullName || !userFormData.email) {
      setStatusMessage('Please fill all user fields');
      return;
    }
    try {
      const res = await axios.post(`${API}/api/admin/users?userId=${user.id}`, {
        fullName: userFormData.fullName,
        email: userFormData.email,
        role: userFormData.role,
      });
      setUsers([...users, res.data]);
      setUserFormData({ fullName: '', email: '', role: 'USER' });
      setShowUserForm(false);
      setStatusMessage('User created successfully');
    } catch (e) {
      setStatusMessage('Failed to create user: ' + (e.response?.data?.error || e.message));
    }
  };



  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API}/api/admin/users/${userId}?userId=${user.id}`);
        setUsers(users.filter(u => u.id !== userId));
        setStatusMessage('User deleted successfully');
      } catch (e) {
        setStatusMessage('Failed to delete user: ' + (e.response?.data?.error || e.message));
      }
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    try {
      const res = await axios.put(`${API}/api/admin/users/${userId}/role?userId=${user.id}&role=${newRole}`);
      setUsers(users.map(u => u.id === userId ? { ...u, role: res.data.role } : u));
      setStatusMessage('User role changed successfully');
    } catch (e) {
      setStatusMessage('Failed to change user role');
    }
  };

  const handleResetPasswordClick = (userId) => {
    setResetPasswordData({ userId, newPassword: '', confirmPassword: '' });
    setShowResetPassword(true);
  };

  const handleResetPasswordSubmit = async () => {
    if (!resetPasswordData.newPassword || !resetPasswordData.confirmPassword) {
      setStatusMessage('Please fill all password fields');
      return;
    }
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setStatusMessage('Passwords do not match');
      return;
    }
    try {
      const res = await axios.put(
        `${API}/admin/users/${resetPasswordData.userId}/reset-password?userId=${user.id}`,
        { newPassword: resetPasswordData.newPassword }
      );
      setStatusMessage(`Password reset successfully! Temp password: ${res.data.tempPassword}`);
      setShowResetPassword(false);
      setResetPasswordData({ userId: null, newPassword: '', confirmPassword: '' });
    } catch (e) {
      setStatusMessage('Failed to reset password: ' + (e.response?.data?.error || e.message));
    }
  };

  // BOOK CRUD OPERATIONS
  const handleCreateBook = async () => {
    if (!bookFormData.title || !bookFormData.author) {
      setStatusMessage('Please fill title and author');
      return;
    }
    try {
      const res = await axios.post(`${API}/api/books?userId=${user.id}`, bookFormData);
      setBooks([...books, res.data]);
      setBookFormData({ title: '', author: '', description: '', isbn: '' });
      setShowBookForm(false);
      setStatusMessage('Book created successfully');
    } catch (e) {
      console.error(e);
      setStatusMessage('Failed to create book: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`${API}/api/books/${bookId}`);
        setBooks(books.filter(b => b.id !== bookId));
        setStatusMessage('Book deleted successfully');
      } catch (e) {
        console.error(e);
        setStatusMessage('Failed to delete book: ' + (e.response?.data?.error || e.message));
      }
    }
  };

  // FEEDBACK CRUD OPERATIONS
  const handleUpdateFeedbackStatus = async (id, status) => {
    try {
      await axios.put(`${API}/api/v1/feedback/${id}/status`, { status });
      setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status } : f));
      setStatusMessage(`Feedback marked as ${status}`);
    } catch (e) {
      console.error(e);
      setStatusMessage('Failed to update feedback status');
    }
  };

  // Logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('authUser');
      localStorage.removeItem('adminSession');
      navigate('/admin-login');
    }
  };

  return (
    <div className={styles.adminDashboard}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoIcon}>⚡</div>
          <div className={styles.logoText}>
            <h2>Admin<span className={styles.highlight}>Pro</span></h2>
            <p>Control Panel</p>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.activeNav : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className={styles.navIcon}>📊</span> Dashboard
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'users' ? styles.activeNav : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className={styles.navIcon}>👥</span> Users
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'books' ? styles.activeNav : ''}`}
            onClick={() => setActiveTab('books')}
          >
            <span className={styles.navIcon}>📚</span> Books
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'feedback' ? styles.activeNav : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <span className={styles.navIcon}>💬</span> Feedback
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>👤</div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user?.fullName}</span>
              <span className={styles.userRole}>Administrator</span>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <span className={styles.navIcon}>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        
        {/* Top Header Section */}
        {/* Dashboard Tab uses the Hero Banner, others use Top Header */}
        {activeTab === 'dashboard' ? (
          <header className={styles.heroBanner}>
            <div className={styles.heroContent}>
              <h1>Welcome back, <span className={styles.heroHighlight}>{user?.fullName || 'Admin'}</span> 👋</h1>
              <p>Here's what's happening across your digital library today.</p>
              <div className={styles.heroWidgets}>
                <div className={styles.heroWidgetCard}>
                  <div className={styles.heroWidgetIcon}>🕒</div>
                  <div>
                    <span className={styles.widgetLabel}>Local Time</span>
                    <span className={styles.widgetData}>
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className={styles.heroWidgetCard}>
                  <div className={styles.heroWidgetIcon}>📅</div>
                  <div>
                    <span className={styles.widgetLabel}>Current Date</span>
                    <span className={styles.widgetData}>
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.heroShapes}>
              <div className={styles.shape1}></div>
              <div className={styles.shape2}></div>
            </div>
          </header>
        ) : (
          <header className={styles.topHeader}>
            <div className={styles.headerTitles}>
              <h1 className={styles.pageTitle}>
                {activeTab === 'users' && 'User Management'}
                {activeTab === 'books' && 'Book Management'}
                {activeTab === 'feedback' && 'User Feedback'}
              </h1>
              <p className={styles.pageSubtitle}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </header>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div className={styles.statusMessage}>
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage('')} className={styles.closeStatus}>✕</button>
          </div>
        )}

        <div className={styles.contentWrapper}>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className={`${styles.dashboardSection} ${styles.fadeIn}`}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <div className={styles.statIcon}>📚</div>
                  </div>
                  <div className={styles.statInfo}>
                    <div className={styles.statLabel}>Total Books</div>
                    <div className={styles.statValue}>{loading ? '...' : stats.totalBooks}</div>
                  </div>
                  <div className={styles.sparkline}>
                    <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path d="M0 30 L10 25 L20 28 L30 15 L40 20 L50 10 L60 15 L70 5 L80 12 L90 2 L100 10 L100 30 Z" fill="rgba(255,255,255,0.15)"/>
                      <path d="M0 30 L10 25 L20 28 L30 15 L40 20 L50 10 L60 15 L70 5 L80 12 L90 2 L100 10" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <div className={styles.statIcon}>👥</div>
                  </div>
                  <div className={styles.statInfo}>
                    <div className={styles.statLabel}>Total Users</div>
                    <div className={styles.statValue}>{loading ? '...' : stats.totalUsers}</div>
                  </div>
                  <div className={styles.sparkline}>
                    <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path d="M0 30 L20 25 L40 28 L60 15 L80 12 L100 5 L100 30 Z" fill="rgba(255,255,255,0.15)"/>
                      <path d="M0 30 L20 25 L40 28 L60 15 L80 12 L100 5" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <div className={styles.statIcon}>📈</div>
                  </div>
                  <div className={styles.statInfo}>
                    <div className={styles.statLabel}>System Activity</div>
                    <div className={styles.statValue}>{loading ? '...' : stats.totalActivity}</div>
                  </div>
                  <div className={styles.sparkline}>
                    <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path d="M0 30 L10 22 L20 26 L30 10 L40 18 L50 8 L60 12 L70 2 M80 15 L90 5 L100 8 L100 30 Z" fill="rgba(255,255,255,0.15)"/>
                      <path d="M0 30 L10 22 L20 26 L30 10 L40 18 L50 8 L60 12 L70 2 L80 15 L90 5 L100 8" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className={styles.dashboardWidgetsGrid}>
                {/* System Status & Actions */}
                <div className={styles.widgetColumn}>
                  <div className={styles.quickActions}>
                    <h3>Quick Actions</h3>
                    <div className={styles.actionButtons}>
                      <button onClick={() => setActiveTab('users')} className={styles.actionBtn}>
                         Manage Users
                      </button>
                      <button onClick={() => setActiveTab('books')} className={styles.actionBtn}>
                         Manage Books
                      </button>
                      <button onClick={() => { setShowUserForm(true); setActiveTab('users'); }} className={styles.actionBtnSecondary}>
                        + Add New User
                      </button>
                      <button onClick={() => { setShowBookForm(true); setActiveTab('books'); }} className={styles.actionBtnSecondary}>
                        + Add New Book
                      </button>
                    </div>
                  </div>

                  <div className={styles.systemStatusCard}>
                    <h3>⚙️ System Status</h3>
                    <ul className={styles.statusList}>
                      <li>
                        <div className={styles.statusInfo}>
                          <span className={styles.statusIcon}>🌐</span>
                          <span className={styles.statusText}>API Connectivity</span>
                        </div>
                        <span className={`${styles.statusBadge} ${styles.badgeSuccess}`}>Operational</span>
                      </li>
                      <li>
                        <div className={styles.statusInfo}>
                          <span className={styles.statusIcon}>🗄️</span>
                          <span className={styles.statusText}>Database Instance</span>
                        </div>
                        <span className={`${styles.statusBadge} ${styles.badgeSuccess}`}>Connected</span>
                      </li>
                      <li>
                        <div className={styles.statusInfo}>
                          <span className={styles.statusIcon}>🔥</span>
                          <span className={styles.statusText}>Server Load</span>
                        </div>
                        <span className={`${styles.statusBadge} ${styles.badgeWarning}`}>Moderate (42%)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Recent Activity Feed */}
                <div className={styles.activityFeedCard}>
                  <div className={styles.activityHeader}>
                    <h3>Recent Activity</h3>
                    <button className={styles.viewAllBtn}>View All</button>
                  </div>
                  <div className={styles.timeline}>
                    <div className={styles.timelineItem}>
                      <div className={styles.timelineMarker}>👤</div>
                      <div className={styles.timelineContent}>
                        <p className={styles.timelineText}><strong>Admin</strong> added a new user <em>{users[users.length - 1]?.fullName || 'Jane Doe'}</em></p>
                        <span className={styles.timelineTime}>Just now</span>
                      </div>
                    </div>
                    <div className={styles.timelineItem}>
                      <div className={styles.timelineMarker}>📚</div>
                      <div className={styles.timelineContent}>
                        <p className={styles.timelineText}>New book <strong>{books[books.length - 1]?.title || 'System Design Interview'}</strong> was registered.</p>
                        <span className={styles.timelineTime}>2 hours ago</span>
                      </div>
                    </div>
                    <div className={styles.timelineItem}>
                      <div className={styles.timelineMarker}>🔄</div>
                      <div className={styles.timelineContent}>
                        <p className={styles.timelineText}>System backup completed successfully.</p>
                        <span className={styles.timelineTime}>Yesterday at 11:00 PM</span>
                      </div>
                    </div>
                    <div className={styles.timelineItem}>
                      <div className={styles.timelineMarker}>⚠️</div>
                      <div className={styles.timelineContent}>
                        <p className={styles.timelineText}>High traffic detected from AI Recommendation Engine.</p>
                        <span className={styles.timelineTime}>Yesterday at 4:30 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className={`${styles.usersSection} ${styles.fadeIn}`}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Registered Users</h2>
                <button 
                  onClick={() => setShowUserForm(true)}
                  className={styles.addBtn}
                >
                  <span className={styles.btnIcon}>+</span> Add New User
                </button>
              </div>

              {showUserForm && (
                <div className={styles.formCard}>
                  <h3>Create New User</h3>
                  <div className={styles.formGrid}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={userFormData.fullName}
                      onChange={e => setUserFormData({...userFormData, fullName: e.target.value})}
                      className={styles.formInput}
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={userFormData.email}
                      onChange={e => setUserFormData({...userFormData, email: e.target.value})}
                      className={styles.formInput}
                    />
                    <select
                      value={userFormData.role}
                      onChange={e => setUserFormData({...userFormData, role: e.target.value})}
                      className={styles.formInput}
                    >
                      <option value="USER">Standard User</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>
                  <div className={styles.formButtons}>
                    <button onClick={handleCreateUser} className={styles.saveBtn}>Save User</button>
                    <button onClick={() => setShowUserForm(false)} className={styles.cancelBtn}>Cancel</button>
                  </div>
                </div>
              )}

              <div className={styles.usersGrid}>
                {users.map(u => (
                  <div key={u.id} className={styles.userCard}>
                    <div className={styles.userCardHeader}>
                      <div className={styles.cellAvatarLarge}>👤</div>
                      <div className={styles.userCardInfo}>
                        <h4 className={styles.userCardName} title={u.fullName}>{u.fullName}</h4>
                        <p className={styles.userCardEmail} title={u.email}>{u.email}</p>
                      </div>
                    </div>
                    <div className={styles.userCardBody}>
                      <div className={styles.roleControl}>
                        <span className={styles.roleLabel}>System Role</span>
                        <select 
                          value={u.role}
                          onChange={e => handleChangeUserRole(u.id, e.target.value)}
                          className={`${styles.roleBadge} ${u.role === 'ADMIN' ? styles.roleAdmin : styles.roleUser}`}
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.userCardActions}>
                      <button onClick={() => handleResetPasswordClick(u.id)} className={styles.cardActionBtn} title="Reset Password">
                        🔐 Reset
                      </button>
                      <button onClick={() => handleDeleteUser(u.id)} className={`${styles.cardActionBtn} ${styles.btnDangerText}`} title="Delete User">
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Books Tab */}
          {activeTab === 'books' && (
            <div className={`${styles.booksSection} ${styles.fadeIn}`}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Library Catalog</h2>
                <button 
                  onClick={() => setShowBookForm(true)}
                  className={styles.addBtn}
                >
                  <span className={styles.btnIcon}>+</span> Add New Book
                </button>
              </div>

              {showBookForm && (
                <div className={styles.formCard}>
                  <h3>Register New Book</h3>
                  <div className={styles.formGrid}>
                    <input
                      type="text"
                      placeholder="Book Title"
                      value={bookFormData.title}
                      onChange={e => setBookFormData({...bookFormData, title: e.target.value})}
                      className={styles.formInput}
                    />
                    <input
                      type="text"
                      placeholder="Author Name"
                      value={bookFormData.author}
                      onChange={e => setBookFormData({...bookFormData, author: e.target.value})}
                      className={styles.formInput}
                    />
                    <input
                      type="text"
                      placeholder="ISBN Number"
                      value={bookFormData.isbn}
                      onChange={e => setBookFormData({...bookFormData, isbn: e.target.value})}
                      className={styles.formInput}
                    />
                  </div>
                  <textarea
                    placeholder="Book Description & Synopsis"
                    value={bookFormData.description}
                    onChange={e => setBookFormData({...bookFormData, description: e.target.value})}
                    className={styles.formTextarea}
                  />
                  <div className={styles.formButtons}>
                    <button onClick={handleCreateBook} className={styles.saveBtn}>Save Book</button>
                    <button onClick={() => setShowBookForm(false)} className={styles.cancelBtn}>Cancel</button>
                  </div>
                </div>
              )}

              <div className={styles.booksGrid}>
                {books.map(b => (
                  <div key={b.id} className={styles.bookCard}>
                    <div className={styles.bookCardInner}>
                      <div className={styles.bookIcon}>📖</div>
                      <div className={styles.bookDetails}>
                        <h4 title={b.title}>{b.title}</h4>
                        <p className={styles.bookAuthor}>{b.author}</p>
                        <p className={styles.bookIsbn}>ISBN: {b.isbn || 'N/A'}</p>
                      </div>
                    </div>
                    <p className={styles.bookDescription}>{b.description}</p>
                    <div className={styles.bookActions}>
                      <button 
                        onClick={() => handleDeleteBook(b.id)}
                        className={styles.btnDeleteSolid}
                      >
                        Remove Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className={`${styles.usersSection} ${styles.fadeIn}`}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>User Feedback & Requests</h2>
              </div>

              <div className={styles.usersGrid}>
                {feedbacks.map(f => (
                  <div key={f.id} className={styles.userCard}>
                    <div className={styles.userCardHeader}>
                      <div className={styles.cellAvatarLarge}>
                        {f.type === 'bug' ? '🐛' : f.type === 'feature' ? '💡' : '⭐'}
                      </div>
                      <div className={styles.userCardInfo}>
                        <h4 className={styles.userCardName} style={{textTransform: 'capitalize'}}>{f.type}</h4>
                        <p className={styles.userCardEmail}>{new Date(f.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={styles.userCardBody} style={{marginBottom: '10px'}}>
                      <p style={{fontSize: '0.9rem', color: '#4b5563', maxHeight: '100px', overflowY: 'auto'}}>{f.message}</p>
                      {f.rating && <p style={{color: '#f59e0b', marginTop: '5px', fontWeight: 'bold'}}>Rating: {f.rating}/5 ★</p>}
                    </div>
                    <div className={styles.userCardActions} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid transparent',
                        backgroundColor: f.status === 'PENDING' ? '#fee2e2' : f.status === 'REVIEWED' ? '#fef3c7' : '#dcfce3',
                        color: f.status === 'PENDING' ? '#991b1b' : f.status === 'REVIEWED' ? '#92400e' : '#166534',
                        borderColor: f.status === 'PENDING' ? '#fca5a5' : f.status === 'REVIEWED' ? '#fcd34d' : '#86efac'
                      }}>{f.status || 'PENDING'}</span>
                      <div style={{display: 'flex', gap: '5px'}}>
                        {(f.status === 'PENDING' || !f.status) && (
                          <button onClick={() => handleUpdateFeedbackStatus(f.id, 'REVIEWED')} className={styles.cardActionBtn} style={{background: '#fef3c7', color: '#92400e', border: 'none'}}>
                            Review
                          </button>
                        )}
                        {f.status !== 'SOLVED' && (
                          <button onClick={() => handleUpdateFeedbackStatus(f.id, 'SOLVED')} className={styles.cardActionBtn} style={{background: '#dcfce3', color: '#166534', border: 'none'}}>
                            Solve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {feedbacks.length === 0 && (
                  <p style={{gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#6b7280'}}>No feedback submitted yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Password Reset Modal */}
      {showResetPassword && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.fadeInUp}`}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Reset User Password</h3>
              <button onClick={() => setShowResetPassword(false)} className={styles.closeModalBtn}>✕</button>
            </div>
            <p className={styles.modalText}>Enter a new, secure password for this account. The user will be able to log in with these credentials immediately.</p>
            
            <div className={styles.formGroup}>
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={resetPasswordData.newPassword}
                onChange={e => setResetPasswordData({...resetPasswordData, newPassword: e.target.value})}
                className={styles.formInput}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={resetPasswordData.confirmPassword}
                onChange={e => setResetPasswordData({...resetPasswordData, confirmPassword: e.target.value})}
                className={styles.formInput}
              />
            </div>
            
            <div className={styles.modalActions}>
              <button 
                onClick={handleResetPasswordSubmit}
                className={styles.btnConfirm}
              >
                Confirm Reset
              </button>
              <button 
                onClick={() => setShowResetPassword(false)}
                className={styles.btnCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
