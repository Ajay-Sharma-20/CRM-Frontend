import React from 'react';
import { useAuth } from '../auth/AuthContext';

interface CanProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({ permission, fallback = null, children }) => {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

export const usePermission = (permissionKey: string): boolean => {
  const { hasPermission } = useAuth();
  return hasPermission(permissionKey);
};
