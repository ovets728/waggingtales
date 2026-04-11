'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useWizard } from '@/lib/wizard/store';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function StepPet() {
  const t = useTranslations('wizard');
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
          type: 'SET_PET_IMAGE',
          payload: {
            petImage: file,
            petImagePreview: e.target?.result as string,
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
      type: 'SET_PET_IMAGE',
      payload: { petImage: null, petImagePreview: null },
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [dispatch]);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-xl font-bold text-text-main">{t('step1Title')}</h2>
        <p className="text-text-muted text-sm mt-1">{t('step1Subtitle')}</p>
      </div>

      {/* Pet Name */}
      <div>
        <label
          htmlFor="petName"
          className="block text-sm font-medium text-text-main mb-1"
        >
          {t('petName')} *
        </label>
        <input
          id="petName"
          type="text"
          value={state.petName}
          onChange={(e) =>
            dispatch({
              type: 'SET_PET_DATA',
              payload: { petName: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={t('petName')}
        />
      </div>

      {/* Pet Personality */}
      <div>
        <label
          htmlFor="petPersonality"
          className="block text-sm font-medium text-text-main mb-1"
        >
          {t('petPersonality')}
        </label>
        <textarea
          id="petPersonality"
          value={state.petPersonality}
          onChange={(e) =>
            dispatch({
              type: 'SET_PET_DATA',
              payload: { petPersonality: e.target.value },
            })
          }
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          placeholder={t('petPersonality')}
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">
          {t('petImage')} *
        </label>

        {state.petImagePreview ? (
          <div className="relative rounded-lg overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.petImagePreview}
              alt={state.petName || 'Pet'}
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
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
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
            <p className="text-xs text-text-muted mt-1">{t('maxFileSize')}</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleInputChange}
          className="hidden"
        />

        {fileError && (
          <p className="mt-2 text-sm text-error">{fileError}</p>
        )}
      </div>
    </div>
  );
}
