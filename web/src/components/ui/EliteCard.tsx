import React from 'react';

interface EliteCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

export default function EliteCard({ children, className = '', padding = 'p-6' }: EliteCardProps) {
  return (
    <div className={`bg-elite-surface border border-white/[0.06] rounded-2xl ${padding} ${className}`}>
      {children}
    </div>
  );
}
