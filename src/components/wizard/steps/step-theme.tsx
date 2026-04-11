'use client';

import { useTranslations } from 'next-intl';
import { useWizard } from '@/lib/wizard/store';

const themes = [
  { key: 'spaceAdventure', emoji: '\uD83D\uDE80' },
  { key: 'underwaterKingdom', emoji: '\uD83C\uDF0A' },
  { key: 'enchantedForest', emoji: '\uD83C\uDF33' },
  { key: 'pirateTreasure', emoji: '\uD83C\uDFF4\u200D\u2620\uFE0F' },
  { key: 'dinosaurLand', emoji: '\uD83E\uDD95' },
] as const;

const artStyles = [
  { key: 'watercolor' },
  { key: 'cartoon' },
  { key: 'pixelArt' },
  { key: 'storybookClassic' },
] as const;

export function StepTheme() {
  const t = useTranslations('wizard');
  const { state, dispatch } = useWizard();

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-text-main">{t('step3Title')}</h2>
        <p className="text-text-muted text-sm mt-1">{t('step3Subtitle')}</p>
      </div>

      {/* Theme Picker */}
      <div>
        <h3 className="text-sm font-medium text-text-main mb-3">
          {t('selectTheme')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {themes.map(({ key, emoji }) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                dispatch({
                  type: 'SET_THEME_DATA',
                  payload: { theme: key },
                })
              }
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                state.theme === key
                  ? 'border-primary bg-primary/5 scale-[1.03]'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="text-3xl block mb-2">{emoji}</span>
              <span className="text-sm font-medium text-text-main">
                {t(key)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Art Style Picker */}
      <div>
        <h3 className="text-sm font-medium text-text-main mb-3">
          {t('selectStyle')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {artStyles.map(({ key }) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                dispatch({
                  type: 'SET_THEME_DATA',
                  payload: { artStyle: key },
                })
              }
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                state.artStyle === key
                  ? 'border-primary bg-primary/5 scale-[1.03]'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="text-sm font-medium text-text-main">
                {t(key)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
