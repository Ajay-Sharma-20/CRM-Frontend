import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  className,
}) => {
  const styles = {
    info: {
      bg: 'bg-blue-50/80 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-50/80 border-amber-200 text-amber-900',
      icon: <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />,
    },
    error: {
      bg: 'bg-rose-50/80 border-rose-200 text-rose-900',
      icon: <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />,
    },
  };

  const current = styles[type];

  return (
    <div className={twMerge(clsx('flex gap-3 p-3.5 rounded-xl border text-sm', current.bg, className))}>
      {current.icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
};
