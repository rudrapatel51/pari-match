import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'live' | 'upcoming' | 'default';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variantClasses = {
    live: 'bg-accent-green text-white text-xs font-bold px-2 py-1 rounded uppercase animate-pulse',
    upcoming: 'bg-accent-yellow text-neutral-gray-900 text-xs font-bold px-2 py-1 rounded uppercase',
    default: 'bg-neutral-gray-500 text-white text-xs font-bold px-2 py-1 rounded uppercase',
  };

  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;