import { ReactNode } from 'react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { Navigate } from 'react-router';
import { UserRole } from '@/shared/types';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If a specific role is required, check if user has it
  if (requiredRole) {
    if (user.role !== requiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
