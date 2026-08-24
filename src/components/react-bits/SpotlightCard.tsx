import React, { useRef, useState, useCallback } from 'react';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
}

export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(201, 117, 58, 0.18)',
  spotlightSize = 400,
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        background: 'rgba(253, 244, 227, 0.03)',
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        border: '1px solid rgba(253, 244, 227, 0.08)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(253, 244, 227, 0.06)',
      }}
    >
      {/* Spotlight glow */}
      <div
        className="pointer-events-none absolute transition-opacity duration-300"
        style={{
          left: position.x,
          top: position.y,
          width: spotlightSize,
          height: spotlightSize,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${spotlightColor} 0%, transparent 70%)`,
          transform: 'translate(-50%, -50%)',
          opacity: isHovering ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
      {children}
    </div>
  );
}
