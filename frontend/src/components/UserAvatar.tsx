import React from 'react';

interface UserAvatarProps {
  username: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const AVATAR_COLORS = [
  'oklch(0.52 0.14 162)',  // teal
  'oklch(0.55 0.15 200)',  // blue-teal
  'oklch(0.58 0.13 240)',  // blue
  'oklch(0.55 0.14 280)',  // purple
  'oklch(0.58 0.15 320)',  // pink
  'oklch(0.60 0.14 30)',   // orange
  'oklch(0.58 0.14 60)',   // yellow-green
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const SIZE_CLASSES = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-14 h-14 text-lg',
};

export default function UserAvatar({ username, size = 'md', className = '' }: UserAvatarProps) {
  const initials = getInitials(username || '?');
  const bgColor = getAvatarColor(username || '');

  return (
    <div
      className={`${SIZE_CLASSES[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0 ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
}
