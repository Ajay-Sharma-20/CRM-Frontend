import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../../components/Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  allowedRoles,
}) => {
  const { user, token, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-xs font-medium text-zinc-500">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role restrictions if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role?.slug || '';
    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-200 p-8 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900">Access Restricted</h2>
            <p className="text-xs text-zinc-500 mt-2">
              Your role ({user.role?.name}) does not have authorization to view this section.
            </p>
            <div className="mt-6">
              <Button variant="gradient" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Check permission restriction
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-200 p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900">Permission Denied</h2>
          <p className="text-xs text-zinc-500 mt-2">
            You do not possess the required permission: <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded text-[11px]">{requiredPermission}</code>.
          </p>
          <div className="mt-6">
            <Button variant="gradient" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
