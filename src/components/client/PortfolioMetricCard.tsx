import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Sparkline from './Sparkline';

interface PortfolioMetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  isPositive?: boolean;
  sparklineData?: { value: number }[];
  accentColor?: 'gold' | 'green' | 'red';
  index?: number;
  miniBars?: number[];
}

const accentMap = {
  gold: '#B8A14E',
  green: '#10B981',
  red: '#EF4444',
};

export default function PortfolioMetricCard({
  label,
  value,
  subValue,
  isPositive = true,
  sparklineData,
  accentColor = 'gold',
  index = 0,
  miniBars,
}: PortfolioMetricCardProps) {
  const topColor = accentMap[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className="glass-panel-hover"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderTop: `3px solid ${topColor}`,
        borderRadius: 16,
        padding: 24,
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      <p
        className="text-caption"
        style={{
          color: '#55555E',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      <p
        className="text-mono-l"
        style={{
          color: accentColor === 'green' || accentColor === 'red' ? topColor : '#F5F5F0',
          marginBottom: subValue ? 4 : 0,
        }}
      >
        {value}
      </p>

      {subValue && (
        <div className="flex items-center gap-1" style={{ marginBottom: 12 }}>
          {isPositive ? (
            <TrendingUp size={14} color="#10B981" />
          ) : (
            <TrendingDown size={14} color="#EF4444" />
          )}
          <p
            className="text-body"
            style={{ color: isPositive ? '#10B981' : '#EF4444' }}
          >
            {subValue}
          </p>
        </div>
      )}

      {sparklineData && sparklineData.length > 0 && (
        <Sparkline
          data={sparklineData}
          color={isPositive ? '#10B981' : '#EF4444'}
          width="100%"
          height={40}
        />
      )}

      {miniBars && miniBars.length > 0 && (
        <div className="flex items-end gap-1" style={{ height: 28, marginTop: 8 }}>
          {miniBars.map((h, i) => (
            <div
              key={i}
              style={{
                width: 4,
                height: `${Math.max(4, h * 24)}px`,
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
