'use client';

import { useTranslations } from 'next-intl';
import { useWizard } from '@/lib/wizard/store';

export function StepReview() {
  const t = useTranslations('wizard');
  const tc = useTranslations('common');
  const { state, dispatch } = useWizard();

  const goToStep = (step: 1 | 2 | 3 | 4 | 5) => {
    dispatch({ type: 'SET_STEP', payload: step });
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-xl font-bold text-text-main">
          {t('reviewSummary')}
        </h2>
        <p className="text-text-muted text-sm mt-1">{t('step4Subtitle')}</p>
      </div>

      {/* Pet Section */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-main">
            {t('step1Title')}
          </h3>
          <button
            type="button"
            onClick={() => goToStep(1)}
            className="text-xs text-primary hover:underline"
          >
            {tc('edit')}
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-text-main">
            <span className="text-text-muted">{t('petName')}:</span>{' '}
            {state.petName}
          </p>
          {state.petPersonality && (
            <p className="text-sm text-text-main">
              <span className="text-text-muted">{t('petPersonality')}:</span>{' '}
              {state.petPersonality}
            </p>
          )}
          {state.petImagePreview && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={state.petImagePreview}
              alt={state.petName}
              className="w-24 h-24 rounded-md object-cover mt-2"
            />
          )}
        </div>
      </div>

      {/* Human Section */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-main">
            {t('step2Title')}
          </h3>
          <button
            type="button"
            onClick={() => goToStep(2)}
            className="text-xs text-primary hover:underline"
          >
            {tc('edit')}
          </button>
        </div>

        {!state.hasHuman ? (
          <p className="text-sm text-text-muted">No human buddy added.</p>
        ) : (
          <div className="space-y-2">
            {state.humanIsMinor && (
              <p className="text-xs text-text-muted italic">
                Minor character - no image for privacy
              </p>
            )}
            {state.humanHairColor && (
              <p className="text-sm text-text-main">
                <span className="text-text-muted">{t('hairColor')}:</span>{' '}
                {state.humanHairColor}
              </p>
            )}
            {state.humanClothing && (
              <p className="text-sm text-text-main">
                <span className="text-text-muted">{t('clothing')}:</span>{' '}
                {state.humanClothing}
              </p>
            )}
            {state.humanPersonality && (
              <p className="text-sm text-text-main">
                <span className="text-text-muted">{t('personality')}:</span>{' '}
                {state.humanPersonality}
              </p>
            )}
            {!state.humanIsMinor && state.humanImagePreview && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={state.humanImagePreview}
                alt="Human buddy"
                className="w-24 h-24 rounded-md object-cover mt-2"
              />
            )}
            {!state.humanIsMinor && (
              <p className="text-xs text-text-muted">
                {t('termsCheckbox')}:{' '}
                <span
                  className={
                    state.humanTermsAccepted ? 'text-success' : 'text-error'
                  }
                >
                  {state.humanTermsAccepted ? tc('yes') : tc('no')}
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Theme Section */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-main">
            {t('step3Title')}
          </h3>
          <button
            type="button"
            onClick={() => goToStep(3)}
            className="text-xs text-primary hover:underline"
          >
            {tc('edit')}
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-text-main">
            <span className="text-text-muted">{t('selectTheme')}:</span>{' '}
            {state.theme ? t(state.theme as Parameters<typeof t>[0]) : '-'}
          </p>
          <p className="text-sm text-text-main">
            <span className="text-text-muted">{t('selectStyle')}:</span>{' '}
            {state.artStyle
              ? t(state.artStyle as Parameters<typeof t>[0])
              : '-'}
          </p>
        </div>
      </div>

      {/* Generate Button */}
      <button
        type="button"
        onClick={() => goToStep(5)}
        className="w-full py-3 px-6 bg-primary text-white rounded-lg font-semibold text-base hover:bg-primary-hover transition-colors"
      >
        {t('generateStory')}
      </button>
    </div>
  );
}
