'use client';

import { useTranslations } from 'next-intl';
import { useWizard } from '@/lib/wizard/store';

const stepKeys = [
  'step1Title',
  'step2Title',
  'step3Title',
  'step4Title',
  'step5Title',
] as const;

export function WizardProgress() {
  const t = useTranslations('wizard');
  const { state } = useWizard();
  const { currentStep } = state;

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {stepKeys.map((key, index) => {
          const stepNumber = (index + 1) as 1 | 2 | 3 | 4 | 5;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <div key={key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                    isCompleted
                      ? 'bg-primary border-primary text-white'
                      : isCurrent
                        ? 'border-primary text-primary bg-surface'
                        : 'border-border text-text-muted bg-surface'
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={`mt-1.5 text-xs whitespace-nowrap ${
                    isCurrent
                      ? 'text-primary font-medium'
                      : isCompleted
                        ? 'text-text-main'
                        : 'text-text-muted'
                  }`}
                >
                  {t(key)}
                </span>
              </div>
              {index < stepKeys.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mt-[-1.25rem] ${
                    currentStep > stepNumber ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
