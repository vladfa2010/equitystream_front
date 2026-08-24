import React from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  from?: string;
  via?: string;
  to?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function GradientText({
  children,
  from = '#C9753A',
  via = '#E09040',
  to = '#F0A860',
  className = '',
  style = {},
}: GradientTextProps) {
  return (
    <span
      className={className}
      style={{
        background: `linear-gradient(135deg, ${from} 0%, ${via} 50%, ${to} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
