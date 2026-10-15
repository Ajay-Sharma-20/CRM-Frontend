import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded font-medium',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium',
  };

  const variantStyles = {
    default: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    gray: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
  };

  return (
    <span className={twMerge(clsx('inline-flex items-center gap-1', sizeStyles[size], variantStyles[variant], className))}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  switch (status?.toLowerCase()) {
    case 'converted':
    case 'qualified':
    case 'connected':
    case 'active':
    case 'completed':
      return <Badge variant="success" size={size}>{status}</Badge>;
    case 'interested':
    case 'assigned':
      return <Badge variant="purple" size={size}>{status}</Badge>;
    case 'follow-up':
    case 'call later':
    case 'busy':
    case 'pending':
      return <Badge variant="warning" size={size}>{status}</Badge>;
    case 'lost':
    case 'invalid':
    case 'cancelled':
    case 'deactivated':
    case 'wrong number':
    case 'not interested':
      return <Badge variant="danger" size={size}>{status}</Badge>;
    case 'contacted':
    case 'demo/meeting scheduled':
      return <Badge variant="info" size={size}>{status}</Badge>;
    case 'new':
    case 'no answer':
    case 'not reachable':
    default:
      return <Badge variant="default" size={size}>{status || 'New'}</Badge>;
  }
};
