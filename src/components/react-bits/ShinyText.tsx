import React from 'react';

interface ShinyTextProps {
  text: string;
  color?: string;
  shineColor?: string;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function ShinyText({
  text,
  color = '#B8A14E',
  shineColor = '#F5F5F0',
  speed = 3,
  className = '',
  style = {},
}: ShinyTextProps) {
  return (
    <span
      className={`inline-block ${className}`}
      style={{
        background: `linear-gradient(120deg, ${color} 0%, ${color} 30%, ${shineColor} 50%, ${color} 70%, ${color} 100%)`,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: `shimmer ${speed}s linear infinite`,
        ...style,
      }}
    >
      {text}
    </span>
  );
}
