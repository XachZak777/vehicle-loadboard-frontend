import { Navigate } from 'react-router';
import { useAppSelector } from '../store/hooks';
import { UserRole } from '../types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, allowedRoles, requireAuth = true }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/loads" replace />;
  }

  return <>{children}</>;
}
