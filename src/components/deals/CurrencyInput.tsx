import { forwardRef } from 'react';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  prefix?: string;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, placeholder, error, disabled, prefix = '$' }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d.]/g, '');
      // Only allow one decimal point
      const parts = raw.split('.');
      const cleaned = parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, 2) : '');
      onChange(cleaned);
    };

    const formatDisplay = (val: string): string => {
      if (!val) return '';
      const parts = val.split('.');
      const intPart = parts[0];
      const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.length > 1 ? `${formatted}.${parts[1]}` : formatted;
    };

    return (
      <div className="w-full">
        <div className="relative">
          {prefix && (
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-medium"
              style={{ color: '#8A8A93', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            value={formatDisplay(value)}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full text-[14px] transition-all duration-200 outline-none"
            style={{
              background: '#14141C',
              border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 12,
              padding: prefix ? '12px 16px 12px 32px' : '12px 16px',
              color: '#F5F5F0',
              fontFamily: 'JetBrains Mono, monospace',
              boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.15)' : 'none',
            }}
            onFocus={(e) => {
              if (!error) {
                e.target.style.borderColor = '#B8A14E';
                e.target.style.boxShadow = '0 0 0 3px rgba(184, 161, 78, 0.15)';
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        {error && (
          <p className="mt-2 text-[12px] font-medium" style={{ color: '#EF4444' }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
export default CurrencyInput;
