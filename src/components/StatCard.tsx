import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  color?: 'purple' | 'pink' | 'blue' | 'green' | 'amber';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = 'positive',
  color = 'purple',
  className,
}) => {
  const iconColorStyles = {
    purple: 'bg-purple-50 text-purple-600 border border-purple-100',
    pink: 'bg-pink-50 text-pink-600 border border-pink-100',
    blue: 'bg-blue-50 text-blue-600 border border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border border-amber-100',
  };

  return (
    <div className={twMerge('bg-white border border-zinc-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</span>
        {icon && (
          <div className={twMerge('w-9 h-9 rounded-lg flex items-center justify-center', iconColorStyles[color])}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-zinc-900 tracking-tight">{value}</div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span
                className={clsx(
                  'text-xs font-semibold',
                  trendType === 'positive' && 'text-emerald-600',
                  trendType === 'negative' && 'text-rose-600',
                  trendType === 'neutral' && 'text-zinc-500'
                )}
              >
                {trend}
              </span>
            )}
            {subtitle && <span className="text-xs text-zinc-400">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
