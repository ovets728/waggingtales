'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useWizard } from '@/lib/wizard/store';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function StepHuman() {
  const t = useTranslations('wizard');
  const tc = useTranslations('common');
  const { state, dispatch } = useWizard();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    (file: File) => {
      setFileError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setFileError('Please upload a JPG, PNG, GIF, or WebP image.');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setFileError(t('maxFileSize'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        dispatch({
          type: 'SET_HUMAN_IMAGE',
          payload: {
            humanImage: file,
            humanImagePreview: e.target?.result as string,
          },
        });
      };
      reader.readAsDataURL(file);
    },
    [dispatch, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const removeImage = useCallback(() => {
    dispatch({
      type: 'SET_HUMAN_IMAGE',
      payload: { humanImage: null, humanImagePreview: null },
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [dispatch]);

  const setHasHuman = (value: boolean) => {
    dispatch({
      type: 'SET_HUMAN_DATA',
      payload: {
        hasHuman: value,
        // Reset dependent fields when toggling
        humanIsMinor: value ? state.humanIsMinor : null,
        humanDescription: value ? state.humanDescription : null,
        humanHairColor: value ? state.humanHairColor : null,
        humanClothing: value ? state.humanClothing : null,
        humanPersonality: value ? state.humanPersonality : null,
        humanTermsAccepted: value ? state.humanTermsAccepted : false,
      },
    });
    if (!value) {
      dispatch({
        type: 'SET_HUMAN_IMAGE',
        payload: { humanImage: null, humanImagePreview: null },
      });
    }
  };

  const setIsMinor = (value: boolean) => {
    dispatch({
      type: 'SET_HUMAN_DATA',
      payload: {
        humanIsMinor: value,
        humanTermsAccepted: false,
      },
    });
    // Clear image when switching to minor
    if (value) {
      dispatch({
        type: 'SET_HUMAN_IMAGE',
        payload: { humanImage: null, humanImagePreview: null },
      });
    }
  };

  // Phase 1: "Add a human buddy?" toggle
  const showHumanToggle = state.hasHuman === false && state.humanIsMinor === null;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-xl font-bold text-text-main">{t('step2Title')}</h2>
        <p className="text-text-muted text-sm mt-1">{t('step2Subtitle')}</p>
      </div>

      {/* Phase 1: Yes/No toggle */}
      <div>
        <p className="text-sm font-medium text-text-main mb-3">
          {t('addHuman')}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setHasHuman(true)}
            className={`p-4 rounded-lg border-2 text-center transition-all ${
              state.hasHuman
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="text-2xl block mb-1">&#128587;</span>
            <span className="text-sm font-medium text-text-main">
              {tc('yes')}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setHasHuman(false)}
            className={`p-4 rounded-lg border-2 text-center transition-all ${
              !state.hasHuman && !showHumanToggle
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="text-2xl block mb-1">&#128062;</span>
            <span className="text-sm font-medium text-text-main">
              {tc('no')}
            </span>
          </button>
        </div>
      </div>

      {/* Phase 2: Age check (only if hasHuman) */}
      {state.hasHuman && (
        <div>
          <p className="text-sm font-medium text-text-main mb-3">
            {t('humanAge')}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsMinor(true)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                state.humanIsMinor === true
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="text-sm font-medium text-text-main">
                Under 18
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsMinor(false)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                state.humanIsMinor === false
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="text-sm font-medium text-text-main">
                18 or older
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Branch A: Under 18 - text-only fields */}
      {state.hasHuman && state.humanIsMinor === true && (
        <div className="space-y-4">
          <div className="p-3 rounded-md bg-warning/10 border border-warning/30">
            <p className="text-sm text-text-main">{t('under18Notice')}</p>
          </div>

          <div>
            <label
              htmlFor="hairColor"
              className="block text-sm font-medium text-text-main mb-1"
            >
              {t('hairColor')}
            </label>
            <input
              id="hairColor"
              type="text"
              value={state.humanHairColor ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'SET_HUMAN_DATA',
                  payload: { humanHairColor: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t('hairColor')}
            />
          </div>

          <div>
            <label
              htmlFor="clothing"
              className="block text-sm font-medium text-text-main mb-1"
            >
              {t('clothing')}
            </label>
            <input
              id="clothing"
              type="text"
              value={state.humanClothing ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'SET_HUMAN_DATA',
                  payload: { humanClothing: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t('clothing')}
            />
          </div>

          <div>
            <label
              htmlFor="humanPersonality"
              className="block text-sm font-medium text-text-main mb-1"
            >
              {t('personality')}
            </label>
            <textarea
              id="humanPersonality"
              value={state.humanPersonality ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'SET_HUMAN_DATA',
                  payload: { humanPersonality: e.target.value },
                })
              }
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder={t('personality')}
            />
          </div>
        </div>
      )}

      {/* Branch B: 18 or older - terms + image upload + text fields */}
      {state.hasHuman && state.humanIsMinor === false && (
        <div className="space-y-4">
          {/* Terms checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={state.humanTermsAccepted}
              onChange={(e) =>
                dispatch({
                  type: 'SET_HUMAN_DATA',
                  payload: { humanTermsAccepted: e.target.checked },
                })
              }
              className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-main">
              {t('termsCheckbox')}
            </span>
          </label>

          {/* Image upload - disabled until terms accepted */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              {t('uploadImage')}
            </label>

            {!state.humanTermsAccepted && (
              <p className="text-xs text-text-muted mb-2">
                {t('termsRequired')}
              </p>
            )}

            {state.humanImagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={state.humanImagePreview}
                  alt="Human buddy"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-surface/90 border border-border rounded-full p-1.5 hover:bg-error/10 transition-colors"
                  aria-label="Remove image"
                >
                  <svg
                    className="w-4 h-4 text-text-main"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                onDrop={state.humanTermsAccepted ? handleDrop : undefined}
                onDragOver={
                  state.humanTermsAccepted ? handleDragOver : undefined
                }
                onDragLeave={
                  state.humanTermsAccepted ? handleDragLeave : undefined
                }
                onClick={() =>
                  state.humanTermsAccepted && fileInputRef.current?.click()
                }
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  !state.humanTermsAccepted
                    ? 'border-border opacity-50 cursor-not-allowed'
                    : dragOver
                      ? 'border-primary bg-primary/5 cursor-pointer'
                      : 'border-border hover:border-primary/50 cursor-pointer'
                }`}
              >
                <svg
                  className="w-10 h-10 mx-auto text-text-muted mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm text-text-main font-medium">
                  {t('dragDrop')}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {t('maxFileSize')}
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleInputChange}
              disabled={!state.humanTermsAccepted}
              className="hidden"
            />

            {fileError && (
              <p className="mt-2 text-sm text-error">{fileError}</p>
            )}
          </div>

          {/* Text description fields (optional, as fallback) */}
          <div>
            <label
              htmlFor="hairColor"
              className="block text-sm font-medium text-text-main mb-1"
            >
              {t('hairColor')}
            </label>
            <input
              id="hairColor"
              type="text"
              value={state.humanHairColor ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'SET_HUMAN_DATA',
                  payload: { humanHairColor: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t('hairColor')}
            />
          </div>

          <div>
            <label
              htmlFor="clothing"
              className="block text-sm font-medium text-text-main mb-1"
            >
              {t('clothing')}
            </label>
            <input
              id="clothing"
              type="text"
              value={state.humanClothing ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'SET_HUMAN_DATA',
                  payload: { humanClothing: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t('clothing')}
            />
          </div>

          <div>
            <label
              htmlFor="humanPersonality"
              className="block text-sm font-medium text-text-main mb-1"
            >
              {t('personality')}
            </label>
            <textarea
              id="humanPersonality"
              value={state.humanPersonality ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'SET_HUMAN_DATA',
                  payload: { humanPersonality: e.target.value },
                })
              }
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder={t('personality')}
            />
          </div>
        </div>
      )}

      {/* "No human" confirmation */}
      {!state.hasHuman && state.humanIsMinor === null && !showHumanToggle && (
        <div className="p-4 rounded-lg bg-surface border border-border text-center">
          <p className="text-sm text-text-muted">
            No human buddy will be added to the story. Your pet will be the sole
            star!
          </p>
        </div>
      )}
    </div>
  );
}
