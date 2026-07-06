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
      className="glass-panel-hover p-3 sm:p-5 md:p-6"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderTop: `3px solid ${topColor}`,
        borderRadius: 16,
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      <p
        className="text-[10px] sm:text-caption"
        style={{
          color: '#55555E',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      <p
        className="text-[13px] sm:text-base md:text-mono-l font-semibold"
        style={{
          color: accentColor === 'green' || accentColor === 'red' ? topColor : '#F5F5F0',
          marginBottom: subValue ? 2 : 0,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {value}
      </p>

      {subValue && (
        <div className="flex items-center gap-0.5 sm:gap-1" style={{ marginBottom: 8 }}>
          {isPositive ? (
            <TrendingUp size={12} className="hidden sm:block" color="#10B981" />
          ) : (
            <TrendingDown size={12} className="hidden sm:block" color="#EF4444" />
          )}
          <p
            className="text-[10px] sm:text-body"
            style={{ color: isPositive ? '#10B981' : '#EF4444' }}
          >
            {subValue}
          </p>
        </div>
      )}

      {sparklineData && sparklineData.length > 0 && (
        <div className="hidden sm:block">
          <Sparkline
            data={sparklineData}
            color={isPositive ? '#10B981' : '#EF4444'}
            width="100%"
            height={40}
          />
        </div>
      )}

      {miniBars && miniBars.length > 0 && (
        <div className="hidden sm:flex items-end gap-[2px] sm:gap-1 mt-1 sm:mt-2" style={{ height: 20 }}>
          {miniBars.slice(0, 12).map((h, i) => (
            <div
              key={i}
              className="flex-1"
              style={{
                height: `${Math.max(3, h * 16)}px`,
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 1,
                minWidth: 2,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
