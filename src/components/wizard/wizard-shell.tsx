'use client';

import { useTranslations } from 'next-intl';
import { WizardProvider, useWizard } from '@/lib/wizard/store';
import { WizardProgress } from './wizard-progress';
import { StepPet } from './steps/step-pet';
import { StepHuman } from './steps/step-human';
import { StepTheme } from './steps/step-theme';
import { StepReview } from './steps/step-review';
import { StepGenerate } from './steps/step-generate';

function WizardContent() {
  const t = useTranslations('wizard');
  const tc = useTranslations('common');
  const { state, dispatch } = useWizard();
  const { currentStep } = state;

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        // Require pet name and pet image
        return state.petName.trim().length > 0 && state.petImagePreview !== null;
      case 2:
        if (!state.hasHuman) return true;
        // If has human, need at least some description
        if (state.humanIsMinor === null) return false;
        const hasDescription =
          (state.humanHairColor?.trim().length ?? 0) > 0 ||
          (state.humanClothing?.trim().length ?? 0) > 0 ||
          (state.humanPersonality?.trim().length ?? 0) > 0;
        if (state.humanIsMinor) {
          return hasDescription;
        }
        // Adult: requires terms accepted
        return state.humanTermsAccepted;
      case 3:
        return state.theme !== '' && state.artStyle !== '';
      case 4:
        return true;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < 5) {
      dispatch({
        type: 'SET_STEP',
        payload: (currentStep + 1) as 1 | 2 | 3 | 4 | 5,
      });
    }
  };

  const goPrev = () => {
    if (currentStep > 1) {
      dispatch({
        type: 'SET_STEP',
        payload: (currentStep - 1) as 1 | 2 | 3 | 4 | 5,
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepPet />;
      case 2:
        return <StepHuman />;
      case 3:
        return <StepTheme />;
      case 4:
        return <StepReview />;
      case 5:
        return <StepGenerate />;
      default:
        return null;
    }
  };

  const isValid = validateCurrentStep();

  return (
    <div className="w-full">
      <WizardProgress />
      <div className="py-6">{renderStep()}</div>

      {/* Navigation buttons (hidden on step 5) */}
      {currentStep < 5 && (
        <div className="flex items-center justify-between max-w-lg mx-auto pt-4 border-t border-border">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentStep === 1}
            className="px-4 py-2 text-sm font-medium rounded-md border border-border text-text-main hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {tc('back')}
          </button>

          {currentStep === 4 ? (
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_STEP', payload: 5 })}
              className="px-6 py-2 text-sm font-semibold rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
            >
              {t('generateStory')}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!isValid}
              className="px-6 py-2 text-sm font-semibold rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {tc('next')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function WizardShell() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}
