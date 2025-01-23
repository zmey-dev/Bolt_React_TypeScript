import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAdmin, loading, authError } = useAuth();
  const location = useLocation();

  // Show nothing while checking auth status
  if (loading) {
    console.log('AdminRoute: Loading auth status...');
    return null;
  }

  console.log('AdminRoute: Auth check complete');
  console.log('AdminRoute: User:', user?.email);
  console.log('AdminRoute: Is admin:', isAdmin);
  if (authError) console.error('AdminRoute: Auth error:', authError);
  // Redirect to login if not authenticated or not admin
  if (!user || !isAdmin) {
    console.log('AdminRoute: Access denied, redirecting to login');
    console.log('AdminRoute: No user:', !user);
    console.log('AdminRoute: Not admin:', !isAdmin);
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  console.log('AdminRoute: Access granted');
  return <>{children}</>;
}