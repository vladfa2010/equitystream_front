import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full max-w-lg mx-auto mb-8">
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={label} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1 : 1,
                }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="relative flex items-center justify-center"
                style={{ width: 40, height: 40 }}
              >
                <div
                  className="flex items-center justify-center rounded-full transition-all duration-300"
                  style={{
                    width: 40,
                    height: 40,
                    background: isCompleted || isCurrent ? '#B8A14E' : 'transparent',
                    border: isCompleted || isCurrent ? 'none' : '2px solid rgba(255,255,255,0.15)',
                    boxShadow: isCurrent ? '0 0 20px rgba(184,161,78,0.3)' : 'none',
                  }}
                >
                  {isCompleted ? (
                    <Check size={18} color="#0A0A0F" strokeWidth={3} />
                  ) : (
                    <span
                      className="text-[14px] font-semibold"
                      style={{
                        color: isCurrent ? '#0A0A0F' : '#55555E',
                      }}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>
              </motion.div>
              <span
                className="mt-2 text-[13px] font-medium whitespace-nowrap"
                style={{
                  color: isCompleted || isCurrent ? '#F5F5F0' : '#55555E',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {label}
              </span>
            </div>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div className="relative mx-3 mb-5" style={{ width: 80, height: 2 }}>
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                />
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  initial={false}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  style={{ background: '#B8A14E' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
