import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

export function Card({ title, children, className = '', headerActions }: CardProps) {
  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-lg ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
