import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className || ''}`}>
      <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      {description && <p className="text-xs text-zinc-500 max-w-sm mt-1">{description}</p>}
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="gradient" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 bg-zinc-50 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-zinc-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-zinc-200 rounded w-1/4" />
            <div className="h-2.5 bg-zinc-200 rounded w-1/2" />
          </div>
          <div className="h-6 bg-zinc-200 rounded-full w-20" />
        </div>
      ))}
    </div>
  );
};
