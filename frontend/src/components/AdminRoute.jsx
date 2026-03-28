import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  try {
    const raw = localStorage.getItem('authUser');
    const adminSession = localStorage.getItem('adminSession');
    const user = raw ? JSON.parse(raw) : null;
    
    // Verify both admin session flag and admin role
    if (!user || user.role !== 'ADMIN' || !adminSession) {
      return <Navigate to="/admin-login" replace />;
    }
    return children;
  } catch (e) {
    return <Navigate to="/admin-login" replace />;
  }
};

export default AdminRoute;
