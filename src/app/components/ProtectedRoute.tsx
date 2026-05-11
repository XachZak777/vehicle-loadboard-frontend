import { Navigate } from 'react-router';
import { useAppSelector } from '../store/hooks';
import { UserRole } from '../types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  /** Set to true on the /pending-approval route itself to avoid redirect loop */
  skipApprovalCheck?: boolean;
}

export function ProtectedRoute({ children, allowedRoles, requireAuth = true, skipApprovalCheck = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, adminApproved, sessionExpired } = useAppSelector((s) => s.auth);

  if (sessionExpired) {
    return <Navigate to="/session-expired" replace />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Non-admin users who are not yet approved can only see /pending-approval
  if (!skipApprovalCheck && isAuthenticated && !adminApproved && user?.role !== 'admin') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role) && user.role !== 'admin') {
    return <Navigate to="/loads" replace />;
  }

  return <>{children}</>;
}
