import React from 'react';

interface StatusIndicatorProps {
  isOnline: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusIndicator({ isOnline, size = 'sm', className = '' }: StatusIndicatorProps) {
  const sizeClasses = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-block rounded-full border-2 border-sidebar-dark ${sizeClasses} ${
        isOnline ? 'bg-online' : 'bg-offline'
      } ${className}`}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
}
