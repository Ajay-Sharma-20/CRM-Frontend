import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  action,
}) => {
  return (
    <div className={twMerge('bg-white border border-zinc-200/80 rounded-xl shadow-sm overflow-hidden', className)}>
      {(title || action) && (
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="font-semibold text-zinc-900 text-sm md:text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};
